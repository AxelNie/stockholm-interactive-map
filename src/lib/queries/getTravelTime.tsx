export async function getTravelTime() {
  try {
    const apiUrl = "api/getAllTravelTimes";
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.document;
  } catch (error: any) {
    console.error(error);
    const sanitizedError = new Error("Failed to retrieve data");
    sanitizedError.name = error.name;
    sanitizedError.message = error.message;
    throw sanitizedError;
  }
}
