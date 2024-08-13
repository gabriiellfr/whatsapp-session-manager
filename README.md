# WhatsApp Session Manager

## Overview

`whatsapp-session-manager` is a Node.js application designed to manage WhatsApp sessions using a microservice architecture. This service exposes a REST API endpoint to dynamically start and manage WhatsApp sessions based on session IDs. It is intended to be used by another backend server to handle WhatsApp sessions efficiently.

## Features

-   Dynamically start and manage WhatsApp sessions.
-   Utilize a microservice architecture to handle multiple sessions.
-   Log events and errors for debugging and monitoring.

## API

### Start a WhatsApp Session

**Endpoint:** `POST /start-session`

**Description:** Initiates a new WhatsApp session based on the provided session ID.

**Request Body:**

```json
{
    "sessionId": "your_session_id"
}
```
