## Project: Travel Time Visualization in Stockholm

This project aims to build a web application that visualizes the travel time from various locations in Stockholm to T-Centralen (central Stockholm) using Next.js 13 and MongoDB. The core idea of the application is to assist users in exploring and comparing different areas in Stockholm based on their commute time to the city center. In addition to travel times, the project will explore the possibilities of incorporating additional relevant information that would be valuable for individuals considering a move to a new area, such as:

- Housing prices: The application will fetch and display housing price data from a specific API for the selected location, giving users an idea of the cost of living in the area.
- Amenities and facilities: Users will be able to view nearby amenities such as grocery stores, schools, parks, and healthcare facilities, providing a comprehensive overview of the area's livability.
- Crime rates: The application may also incorporate crime rate data for the selected location, allowing users to assess the safety of the area.
- Demographics: Users can access demographic information, such as the average age, income, and education levels of residents, to gain insights into the neighborhood's profile.

# Technologies and APIs

- Next.js 13 (Frontend and backend)
- TypeScript
- MongoDB
- SL API
- API for housing prices?
- Stockholm open data API (data about demographic, environment, crime, cultural)?

# Functionalities

- Visualize travel time: Users can visualize the travel time from various locations in Stockholm to T-Centralen using dynamic colored overlays on the map.
- Detailed travel time information: When clicking on a location on the map, users can view detailed travel time information, including the mode of transportation, distance, and estimated travel time.
- Housing prices: The application will fetch and display housing price data from a specific API for the selected location, providing users with an idea of the cost of living in the area.

Might be implemented:

- Amenities and facilities: Users can view nearby amenities such as grocery stores, schools, parks, and healthcare facilities, providing a comprehensive overview of the area's livability.
- Crime rates: The application will incorporate crime rate data for the selected location, allowing users to assess the safety of the area.
- Demographics: Users can access demographic information, such as the average age, income, and education levels of residents, to gain insights into the neighborhood's profile.

# Travel time data

In this project, I am building a web application using Next.js 13 and MongoDB to visualize the travel time from various locations in Stockholm to T-Centralen (central Stockholm). The travel times have been precalculated using an API provided by SL (Stockholm Public Transport). Due to speed constraints and limitations on the number of API calls, I have precalculated the travel times from all stations (approximately 5000) to T-Centralen.

To cover the entire area of Stockholm, I have also precalculated the travel times from fixed positions, iterating over the area with a step of around 170 meters. I have approximated the walking distance and time based on the Euclidean distance and, considering the travel time from each station, identified the stations with the fastest total travel distance to T-centralen. I then assign the travel time to the area surrounding the coordinate.

MongoDB's geospatial queries enable efficient querying of geographic data by leveraging spatial indexing and advanced geospatial algorithms. In this project, I utilize geospatial queries to retrieve the travel time of any given coordinate. When requestnig the travel time for a specific coordinate, the application performs a query to find the precalculated area that contains the given point, and retrieves the travel time associated with that area.

In the frontend, I will iterate through every 10th pixel on the map, convert the pixel to its corresponding coordinates, and fetch the travel time for that coordinate. This will result in a colored overlay on the map, representing different travel time intervals. The frontend will only need to fetch travel time data for the positions currently visible on the map, and the resolution will be dynamic as the user zooms in and out. I hope that this will not result in a noticable delay when interating with the map and new data needs to be fetched.

One challenge I faced was choosing between between loading all the data at once (which may result in a slow initial loading experience) and loading data on-demand as the user interacts with the map. I have previously attempted an implementation where all the travel distance data is loaded at once. This approach led to slow initial loading times since the whole 3MB data of travel times downloaded. In response, I have decided to implement the more dynamic loading solution explained earlier.

The user will be able to click on a position on the map and view a popup window with more detailed information about the travel time from the selected position to T-Centralen. The popup will display the travel route and the time for each segment. Since not all this information is stored for each position, I will generate an API call to the SL API for the exact coordinate clicked. This will provide more accurate travel times based on the actual walking path to the station, in contrast to the overlay on the map which is limited by the resolution of the precalculated positions.

# Next.js as framework for server side rendering and Next.js 13 features

Next.js is an efficient framework that can improve the performance of web applications through server-side rendering (SSR) and static site generation (SSG). I have chosen Next.js to explore whether these features can help optimize my web application, which deals with relatively complex and large volumes of data. However, since the map is highly interactive, it probably is not possible to render the map on the server. There might still be parts of the website that can benefit from pre-rendering on the server. For example, SSG, which generates the HTML at build time and works when all users can be served the same HTML. Since static content such as the header, footer, and other non-interactive parts of the page can be pre-rendered, using Next.js 13 can still in some sense improve the performance and let me explore the technologies.

One of the new features in Next.js 13 that I would like to explore is self-hosted fonts. Self-hosting fonts can improve the loading time and performance of a web application by reducing the number of external requests and leveraging browser caching. Next.js 13 makes it easy to self-host fonts by providing a built-in @font-face configuration, which simplifies the process of adding custom fonts to the project.

# Deploying the Application to Vercel with Edge Functions

In this project, both the frontend and backend of the travel time visualization application will be deployed to Vercel. Vercel is a platform well-suited for deploying Next.js applications, offering seamless integration.

Vercel's Edge Functions provide an advanced hosting feature that allows server-side code execution at strategically placed points across their global infrastructure. This results in reduced response times and enhanced performance. Deploying the backend using Edge Functions ensures server-side code execution close to users, minimizing latency and improving the user experience.

The entire application can be deployed to Vercel by connecting the project's GitHub repository and configuring deployment settings in the Vercel dashboard. Vercel will build and deploy the application, making it accessible via a unique URL.

# Questions

- Does the project, with its current travel visualization and SL API integration, meet the complexity requirements for the course objectives? If not, would the inclusion of additional API connections, such as one for housing prices and another for obtaining information about specific aspects of Stockholm, be sufficient to achieve the desired complexity?
- Is it necessary to incorporate more CRUD operations (create, read, update, delete) and user authentication features, such as allowing users to log in, to meet the course requirements? Although there may not be an immediate practical use for user authentication, would it be an essential aspect to consider for the project's complexity?
