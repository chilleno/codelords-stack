export default function handler() {
  console.log("Auth handler placeholder");
  return new Response("Auth handler placeholder", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}