# Stock Market Dashboard

## Overview

This project is a **modern, interactive stock market dashboard** built to explore and analyze stock data efficiently. It includes features like:

- **CRUD operations** on stock data
- **Lazy-loaded table** for large datasets
- **Interactive charts**: bar chart, heatmap, and market mood radar
- **Search and filtering**

---

## What I Learned

1. **Efficient Data Handling**  
   - Initially started with a large JSON file. Loading all rows at once caused significant UI lag.  
   - Implemented **lazy-loading** in the table and progressive data fetching, making the UI responsive.

2. **Database Integration**  
   - Built a **database importer script** to move JSON data into a SQL database.  
   - Added full **CRUD functionality** to manage stock data dynamically.

3. **Data Visualization**  
   - Learned to use **Recharts** and **Nivo** for charts like bar charts, heatmaps, and radar charts.  
   - Learned to transform raw stock data into formats suitable for these chart libraries.  

4. **Performance Optimization**  
   - Used **lazy loading data** to improve performance.  
   - Learned that large datasets can significantly slow down chart rendering; optimization is crucial.
---

## Challenges Faced

- **UI Slowdowns**  
  Rendering all rows in a single table blocked the main thread. Lazy loading and progressive rendering solved this.  

- **Chart Performance**  
  Rendering thousands of data points in charts caused lag. but large datasets still pose a challenge.  

- **Data Transformation**  
  Converting raw stock data into formats suitable for different charts (heatmap, radar, bar chart) required careful handling.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Fast API (for API, optional SQL database integration)  

---
