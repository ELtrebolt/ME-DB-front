# Feature: Stats Page

## Summary
In new 'stats' git branch, create a page at `/stats` that serves as a dashboard to view cool stats

## Functionality
- Top Row = for total number of records as text
  - "Total Records in ME-DB: #" in middle
  - "Total Collection: #" on right
  - "Total To-Do: #" on left
- 2nd Row = for distribution by Type
  - Bar Graph of total records per Standard Type (anime, movies, tv, games)
  - Bar Graph of total records per Custom Type (in user.newTypes)
    - if no newTypes, then text that says "no Custom Types to show"
- 3rd Row = for distribution by Year
  - Bar Graph of total records for each year
    - Dropdown Input to switch between All vs To Do vs Collection
- 4th Row = for distribution by Tier
  - Bar Graph of # of X Tier To Do records for All Types
  - Bar Graph of # of X Tier Collection records for All Types
  - Input to change the Tier (default is S)
- 5th Row = for distribution of Tier by Type
  - Stacked bar graph where each main horizontal bar is the Type and split vertically by Tier (with S on the left going down to F on the right)
  - Input to sort horizontal bars by S Tier % desc, F Tier % desc, or Type (which shows Standard first then Custom)

## UI Features
- Responsive design that looks good on web and mobile
- Each Type should have its own unique color, store these colors for each type in constants.js
- store UI Text in constants.js nested inside "statsPage"

## Files to Modify or Create
- Frontend
  - `pages/stats.jsx`
  - Create new components in `components/stats`
  - Write editor logs in `docs/logs-stats.md`
- Backend
  - `api/stats.js`
- Feel free to write tests anywhere in a new folder 