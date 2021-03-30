const Pool = require("pg").Pool;
const uuid = require("uuid").v4;
const parse = require("pg-connection-string").parse;
const awsChime = require("./lib/awsChime");

const dotenv = require("dotenv");
dotenv.config();

const IS_DEV = process.env.ENVIRONMENT === "development";
const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_DB = process.env.POSTGRES_DB;
const DATABASE_URL = process.env.DATABASE_URL;

class SidebarApi {
  constructor() {
    console.log("Initializing database connection...");
    if (IS_DEV) {
      this.pool = new Pool({
        user: POSTGRES_USER,
        host: "localhost",
        database: POSTGRES_DB,
        password: "",
        port: 5432,
      });
    } else {
      this.pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      });
    }
    this._testConnection();

    this.awsChime = new awsChime();
    console.log("Connecting to video chat provider... SUCCESS");
  }

  _testConnection = () => {
    this.pool.query("SELECT NOW()", (error, res) => {
      if (error) throw error; // This will crash the app. Fail fast!
      console.log("Database connection OK :D", res.rows);
    });
  };

  _queryChats = (onSuccess, onError) => {
    this.pool.query(
      "SELECT * FROM chats ORDER BY created_at DESC",
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }
        onSuccess(results.rows);
      }
    );
  };

  _queryChatById = (id, onSuccess, onError) => {
    this.pool.query(
      "SELECT * FROM chats WHERE id = $1",
      [id],
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }
        onSuccess(results.rows[0]);
      }
    );
  };

  _queryAttendeeById = (id, onSuccess, onError) => {
    this.pool.query(
      "SELECT * FROM attendees WHERE id = $1",
      [id],
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }
        onSuccess(results.rows[0]);
      }
    );
  };

  _queryAttendeesByChatId = (id, onSuccess, onError) => {
    this.pool.query(
      "SELECT * FROM attendees WHERE chat_id = $1",
      [id],
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }
        onSuccess(results.rows);
      }
    );
  };

  _updateAttendeeChimeAttendeeId = (
    id,
    chimeAttendeeId,
    onSuccess,
    onError
  ) => {
    this.pool.query(
      "UPDATE attendees SET chime_attendee_id = $2 WHERE id = $1",
      [id, chimeAttendeeId],
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }
        onSuccess(true);
      }
    );
  };

  _updateChatChimeMeetingId = (id, chimeMeetingId, onSuccess, onError) => {
    this.pool.query(
      "UPDATE chats SET chime_meeting_id = $2 WHERE id = $1",
      [id, chimeMeetingId],
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }
        onSuccess(true);
      }
    );
  };

  _updateChatHostingAttendeeId = (
    id,
    hostingAttendeeId,
    onSuccess,
    onError
  ) => {
    this.pool.query(
      "UPDATE chats SET hosting_attendee_id = $2, updated_at = $3 WHERE id = $1",
      [id, hostingAttendeeId, new Date()],
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }
        onSuccess(true);
      }
    );
  };

  _newChat = (onSuccess, onError) => {
    const chatId = uuid();
    this.pool.query(
      `INSERT INTO chats (
        id,
        created_at,
        updated_at
      ) VALUES ($1, $2, $2)`,
      [chatId, new Date()],
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }
        onSuccess(chatId);
      }
    );
  };

  _newAttendee = (chatId, fullName, pronouns, onSuccess, onError) => {
    if (!fullName) {
      const error = new Error("Full name is required.");
      onError(error);
      return;
    }
    const attendeeId = uuid();
    this.pool.query(
      `INSERT INTO attendees (
            id,
            chat_id,
            full_name,
            pronouns,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $5)`,
      [attendeeId, chatId, fullName, pronouns, new Date()],
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }
        onSuccess(attendeeId);
      }
    );
  };

  _deleteChat = (id, onSuccess, onError) => {
    this.pool.query(
      "DELETE FROM attendees WHERE chat_id = $1",
      [id],
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }

        this.pool.query(
          "DELETE FROM chats WHERE id = $1",
          [id],
          (error, results) => {
            if (error) {
              onError(error);
              return;
            }
            onSuccess(true);
          }
        );
      }
    );
  };

  _deleteAttendee = (id, onSuccess, onError) => {
    this.pool.query(
      "DELETE FROM attendees WHERE id = $1",
      [id],
      (error, results) => {
        if (error) {
          onError(error);
          return;
        }
        onSuccess(true);
      }
    );
  };

  getChats = (request, response) => {
    this._queryChats(
      (chats) => {
        const data = {
          chats,
        };
        response.status(200).json(data);
      },
      (error) => {
        this._handleError("getChats::_queryChatById", response, error);
      }
    );
  };

  createChat = async (request, response) => {
    console.log("createChat::INIT", JSON.stringify(request.body));
    this._newChat(
      (chatId) => {
        const { fullName, pronouns } = request.body;
        this._newAttendee(
          chatId,
          fullName,
          pronouns,
          (attendeeId) => {
            this._updateChatHostingAttendeeId(
              chatId,
              attendeeId,
              () => {
                const data = {
                  chatId,
                  hostingAttendeeId: attendeeId,
                };
                console.log("createChat::SUCCESS", data);
                response.status(201).send(data);
              },
              (error) => {
                this._handleError(
                  "createChat::_updateChatHostingAttendeeId",
                  response,
                  error
                );
              }
            );
          },
          (error) => {
            this._handleError("createChat::_newAttendee", response, error);
          }
        );
      },
      (error) => {
        this._handleError("createChat::_newChat", response, error);
      }
    );
  };

  joinChat = (request, response) => {
    console.log("joinChat::INIT", JSON.stringify(request.params));
    const { chatId, attendeeId } = request.params;

    this._queryChatById(
      chatId,
      (chat) => {
        if (!chat) {
          response.status(404).send("Chat not found");
          return;
        }
        this._queryAttendeeById(
          attendeeId,
          (attendee) => {
            if (!attendee || attendee.chat_id !== chatId) {
              response.status(401).send("Attendee not found");
              return;
            }
            console.log("Joining chat as existing attendee...");
            this._handleJoinChatResponse(
              chat,
              attendeeId,
              attendee.chime_attendee_id,
              response
            );
          },
          (error) => {
            this._handleError("joinChat::_queryAttendeeById", response, error);
          }
        );
      },
      (error) => {
        this._handleError("joinChat::_queryChatById", response, error);
      }
    );
  };

  joinChatAsNewAttendee = (request, response) => {
    console.log(
      "joinChatAsNewAttendee::INIT",
      request.params,
      JSON.stringify(request.body)
    );
    const { chatId } = request.params;
    const { fullName, pronouns = "They/them" } = request.body;

    this._queryChatById(
      chatId,
      (chat) => {
        if (!chat || !chat.id) {
          this._handleError(
            "joinChatAsNewAttendee",
            response,
            new Error("Chat not found")
          );
        }

        this._newAttendee(
          chat.id,
          fullName,
          pronouns,
          (attendeeId) => {
            this._queryAttendeeById(
              attendeeId,
              (attendee) => {
                console.log("Joining chat as new attendee...");
                this._handleJoinChatResponse(
                  chat,
                  attendeeId,
                  attendee.chime_attendee_id,
                  response
                );
              },
              (error) => {
                this._handleError(
                  "joinChatAsNewAttendee::_queryAttendeeById",
                  response,
                  error
                );
              }
            );
          },
          (error) => {
            this._handleError(
              "joinChatAsNewAttendee::_newAttendee",
              response,
              error
            );
          }
        );
      },
      (error) => {
        this._handleError(
          "joinChatAsNewAttendee::_queryChatById",
          response,
          error
        );
      }
    );
  };

  leaveChat = (request, response) => {
    console.log("leaveChat::INIT", JSON.stringify(request.params));
    const { chatId, attendeeId } = request.params;
    if (!chatId || !attendeeId) {
      this._handleError("leaveChat", response, "Invalid params");
      return;
    }

    this._queryChatById(
      chatId,
      (chat) => {
        if (!chat) {
          response.status(404).send("Chat not found");
          return;
        }
        const isHost = chat.hosting_attendee_id === attendeeId;
        const chimeMeetingId = chat.chime_meeting_id;
        if (isHost) {
          this._handleDeleteChat(chatId, chimeMeetingId, response);
        } else {
          this._handleDeleteAttendee(
            chatId,
            attendeeId,
            chimeMeetingId,
            response
          );
        }
      },
      (error) => this._handleError("leaveChat", response, error)
    );
  };

  _handleDeleteChat = async (chatId, chimeMeetingId, response) => {
    try {
      await this.awsChime.deleteMeeting(chimeMeetingId);
    } catch (error) {
      this._handleError(
        "_handleDeleteChat::awsChat.deleteMeeting",
        response,
        error
      );
      return;
    }

    this._deleteChat(
      chatId,
      () => {
        console.log(`Chat ${chatId} deleted by hosting attendee.`);
        response.status(204);
      },
      (error) =>
        this._handleError("_handleDeleteChat::_deleteChat", response, error)
    );
  };

  _handleDeleteAttendee = (chatId, attendeeId, chimeMeetingId, response) => {
    this._queryAttendeesByChatId(
      chatId,
      async (attendees) => {
        const attendee = attendees.some(
          (attendee) => attendee.id === attendeeId
        );
        if (!attendee) {
          this._handleError(
            "_handleDeleteAttendee::_queryAttendeesByChatId",
            response,
            "Attendee does not belong to chat"
          );
          return;
        }

        try {
          await this.awsChime.deleteAttendee(
            chimeMeetingId,
            attendee.chimeAttendeeId
          );
        } catch (error) {
          this._handleError(
            "_handleDeleteAttendee::awsChat::deleteAttendee",
            response,
            error
          );
          return;
        }

        this._deleteAttendee(
          attendeeId,
          async () => {
            console.log(
              `Attendee with id ${attendeeId} has left the chat ${chatId}`
            );
            response.status(204);
          },
          (error) =>
            this._handleError(
              "_handleDeleteAttendee::_deleteAttendee",
              response,
              error
            )
        );
      },
      (error) => {
        this._handleError("_handleDeleteAttendee", response, error);
      }
    );
  };

  _handleJoinChatResponse = async (
    chat,
    attendeeId,
    chimeAttendeeId,
    response
  ) => {
    const meetingResponse = await this.awsChime.fetchOrCreateMeeting(
      chat.chime_meeting_id,
      chat.id
    );
    const chimeMeetingId = meetingResponse.Meeting.MeetingId;

    this._updateChatChimeMeetingId(
      chat.id,
      chimeMeetingId,
      async () => {
        chat.chime_meeting_id = chimeMeetingId;
        const attendeeResponse = await this.awsChime.fetchOrCreateMeetingAttendee(
          chimeMeetingId,
          chimeAttendeeId,
          attendeeId
        );
        console.log("---->", attendeeId, chimeAttendeeId, attendeeResponse);
        this._updateAttendeeChimeAttendeeId(
          attendeeId,
          attendeeResponse.Attendee.AttendeeId,
          () => {
            this._queryAttendeesByChatId(
              chat.id,
              (attendees) => {
                const data = {
                  chat,
                  attendeeId,
                  attendees: this._makeListMap(attendees, "id"),
                  meetingResponse,
                  attendeeResponse,
                };
                response.status(200).send(data);
              },
              (error) => {
                this._handleError(
                  "_handleJoinChatResponse::_queryAttendeesByChatId",
                  response,
                  error
                );
              }
            );
          },
          (error) => {
            this._handleError(
              "_handleJoinChatResponse::_updateAttendeeChimeAttendeeId",
              response,
              error
            );
          }
        );
      },
      (error) => {
        this._handleError(
          "_handleJoinChatResponse::_updateChatChimeMeetingId",
          response,
          error
        );
      }
    );
  };

  // private
  _handleError = (tag = "", response, error) => {
    console.error(`ERROR: (${tag})`, error.toString());
    response.status(500).json("Server Error.");
  };

  _makeListMap = (arr, primaryKey) => {
    return arr.reduce((map, item) => {
      if (item && item.hasOwnProperty(primaryKey)) {
        map[item[primaryKey]] = item;
      }
      return map;
    }, {});
  };
}

module.exports = SidebarApi;
