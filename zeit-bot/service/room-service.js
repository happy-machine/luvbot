const { 
    LABEL_ROOM,
    ADMIN_ROOM,
    ARTIST_ROOM,
    MAIN_ROOM,
    TEST_ROOM,
} = process.env;

const ADMIN_GROUP = [ TEST_ROOM, ADMIN_ROOM, LABEL_ROOM]

const ROOM_NAMES = {
    [LABEL_ROOM]: "Label Room",
    [ADMIN_ROOM]: "Admin Room",
    [ARTIST_ROOM]: "Artist Room",
    [MAIN_ROOM]: "Main Room",
    [TEST_ROOM]: "Test Room",
};

export { ADMIN_GROUP, ROOM_NAMES };
