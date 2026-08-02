# Richardson Maturity Model Evaluation

## Task Management API

The Task Management API is implemented using Node.js and Express. It provides
CRUD operations for managing tasks using HTTP methods and resource-oriented
URLs.

## Richardson Maturity Model Evaluation

| Level | Criterion | Does the API satisfy this? | Evidence |
|---|---|---|---|
| Level 0 | Single endpoint with HTTP requests treated as remote procedure calls | No | The API uses multiple resource-oriented endpoints rather than a single endpoint for all operations. |
| Level 1 | Resource-oriented URLs | Yes | The API uses `/tasks` for the task collection and `/tasks/:id` for an individual task. |
| Level 2 | Correct HTTP verbs and meaningful status codes | Yes | GET, POST, PUT, and DELETE are used for CRUD operations. The API returns status codes such as 200, 201, 400, 404, and 500. |
| Level 3 | Hypermedia controls / HATEOAS | No | The current API does not return hypermedia links in its JSON responses. |

## Endpoint Evaluation

| Endpoint | HTTP Method | Purpose | Status Code |
|---|---|---|---|
| `/tasks` | GET | Retrieve all tasks | 200 OK |
| `/tasks` | POST | Create a new task | 201 Created |
| `/tasks/:id` | PUT | Update an existing task | 200 OK |
| `/tasks/:id` | DELETE | Delete an existing task | 200 OK |

Additional error responses include:

- `400 Bad Request` for invalid task IDs or incorrect/missing JSON content type.
- `404 Not Found` when a task does not exist or an undefined route is requested.
- `500 Internal Server Error` through the global error-handling middleware.

## Current Richardson Maturity Level

The current Task Management API satisfies **Richardson Maturity Model Level 2**.

It satisfies Level 1 because resources are represented using resource-oriented
URLs such as `/tasks` and `/tasks/:id`.

It satisfies Level 2 because the API uses the appropriate HTTP verbs for CRUD
operations and returns meaningful HTTP status codes for successful and failed
requests.

The API does not currently implement Level 3 because its responses do not
contain hypermedia controls.

## HATEOAS Example

A Level 3 response could provide links to related actions. For example:

```json
{
    "id": 1,
    "title": "Learn REST API",
    "completed": true,
    "_links": {
        "self": {
            "href": "/tasks/1"
        },
        "update": {
            "href": "/tasks/1"
        },
        "delete": {
            "href": "/tasks/1"
        },
        "collection": {
            "href": "/tasks"
        }
    }
}

## Production Level-2 API Explanation

A production Level-2 API should use resource-oriented URLs, standard HTTP methods, and meaningful HTTP status codes consistently.

For example:

- `GET /tasks` retrieves the task collection.
- `POST /tasks` creates a new task.
- `PUT /tasks/:id` updates a specific task.
- `DELETE /tasks/:id` deletes a specific task.

The API should return appropriate status codes such as `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, and `500 Internal Server Error` according to the result of each request.

## Middleware Implemented

1. `express.json()` for parsing JSON request bodies.
2. Global request logging middleware.
3. Content-Type validation middleware for POST and PUT requests.
4. Task ID validation middleware for PUT and DELETE requests.
5. Custom 404 handler for undefined routes.
6. Global error-handling middleware.