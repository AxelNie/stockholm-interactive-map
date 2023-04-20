export async function getTravelTime() {
  try {
    const apiUrl = "api/getAllTravelTimes";
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data: TravelTimeData[] = await response.json();
    return data.result;
  } catch (error: any) {
    console.error(error);
    const sanitizedError = new Error("Failed to retrieve data");
    sanitizedError.name = error.name;
    sanitizedError.message = error.message;
    throw sanitizedError;
  }
}
