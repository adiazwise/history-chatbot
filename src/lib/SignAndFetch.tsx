
import {signRequest} from "./awssignrequest";
import { ModelResponse, Result } from "./types";


const region = "us-east-2"; // Change to your AWS region
const endpoint =  import.meta.env.VITE_API_GATEWAY_URL ;
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

export async function signAndFetch(body: object): Promise<Result<ModelResponse>> {

var signedRequest = await signRequest(endpoint, "POST", body, accessKeyId, secretAccessKey, region);

  const response = await fetch(endpoint, {
    method: "POST" ,
    headers: signedRequest.headers,
    body: JSON.stringify(body),
  
  });

  if(!response.ok) {
    return {
      data: null,
      error: `Error fetching chatbot response code: ${response.status}`,
    };
  }

  
  return {
    data: await response.json(),
    error: null,
  };
}
