// signRequest.ts

// Returns a SHA-256 hash of the given message as a hex string.
async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  
  // Computes HMAC-SHA256 using the given CryptoKey and returns the signature as a hex string.
  async function hmacSha256(key: CryptoKey, data: string): Promise<string> {
    const encoder = new TextEncoder();
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    return Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  
  // Imports a raw key string for HMAC operations.
  async function importKey(key: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    return crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  }
  
  // Derives the AWS signature key using the secret key, date stamp, region, and service.
  async function getSignatureKey(
    secretKey: string,
    dateStamp: string,
    region: string,
    service: string
  ): Promise<CryptoKey> {
    const kDate = await importKey("AWS4" + secretKey);
    const kDateSigned = await crypto.subtle.sign("HMAC", kDate, new TextEncoder().encode(dateStamp));
    const kDateKey = await crypto.subtle.importKey(
      "raw",
      kDateSigned,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  
    const kRegionSigned = await crypto.subtle.sign("HMAC", kDateKey, new TextEncoder().encode(region));
    const kRegionKey = await crypto.subtle.importKey(
      "raw",
      kRegionSigned,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  
    const kServiceSigned = await crypto.subtle.sign("HMAC", kRegionKey, new TextEncoder().encode(service));
    const kServiceKey = await crypto.subtle.importKey(
      "raw",
      kServiceSigned,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  
    const kSigningSigned = await crypto.subtle.sign("HMAC", kServiceKey, new TextEncoder().encode("aws4_request"));
    return crypto.subtle.importKey(
      "raw",
      kSigningSigned,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  }
  
  // Define the interface for our signed request.
  export interface SignedRequest {
    headers: {
      "Accept": string;
      "Accept-Encoding": string;
      "Content-Type": string;
      "X-Amz-Date": string;
      "X-Amz-Content-Sha256": string;
      "Authorization": string;
      
    };
    body: string;
  }
  
  /**
   * Signs an HTTP request using AWS Signature Version 4.
   *
   * @param url - The full URL of the API Gateway endpoint.
   * @param method - HTTP method (default is "POST").
   * @param body - The request payload as a JavaScript object.
   * @param accessKeyId - Your AWS access key ID.
   * @param secretAccessKey - Your AWS secret access key.
   * @param region - AWS region (default is "us-east-1").
   *
   * @returns A promise that resolves with the signed headers and request body.
   */
  export async function signRequest(
    url: string,
    method: string = "POST",
    body: Record<string, any> = {},
    accessKeyId: string,
    secretAccessKey: string,
    region: string = "us-east-1"
  ): Promise<SignedRequest> {
    const endpoint = new URL(url);
    const service = "execute-api";
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const canonicalUri = endpoint.pathname;
    const canonicalQueryString = endpoint.searchParams.toString();
    const requestPayload = JSON.stringify(body);
  
    // Build canonical headers (without a session token)
    const canonicalHeaders = `host:${endpoint.hostname}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = "host;x-amz-date";
  
    const payloadHash = await sha256(requestPayload);
  
    // Create the canonical request string.
    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");
  
    // Build the string to sign.
    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      await sha256(canonicalRequest),
    ].join("\n");
  
    // Derive the signing key and compute the signature.
    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signature = await hmacSha256(signingKey, stringToSign);
  
    // Construct the Authorization header.
    const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

   
    return {
      headers: {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        "X-Amz-Content-Sha256": payloadHash,
        "X-Amz-Date": amzDate,
        Authorization: authorizationHeader,
     
      },
      body: requestPayload,
    };
  }
  
  export default signRequest;
  