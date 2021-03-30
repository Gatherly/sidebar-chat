
CREATE TABLE chats (
    id uuid PRIMARY KEY,
    chime_meeting_id uuid NULL,
    hosting_attendee_id uuid NULL,
    started_at timestamp NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

CREATE TABLE attendees (
    id uuid PRIMARY KEY,
    chat_id uuid NULL,
    full_name VARCHAR(100),
    pronouns VARCHAR(30),
    chime_attendee_id uuid NULL,
    chime_attendee_token VARCHAR(100),
    joined_at timestamp NULL,
    left_at timestamp NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

ALTER TABLE attendees ADD FOREIGN KEY(chat_id) REFERENCES chats(id);