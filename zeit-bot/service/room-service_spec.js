import { expect, should, assert } from "chai";
import { ROOM_NAMES } from './room-service';
const { 
    LABEL_ROOM,
    ADMIN_ROOM,
    ARTIST_ROOM,
    MAIN_ROOM,
    TEST_ROOM,
} = process.env;

should();

describe("ROOM_NAMES", async () => {
    it("should return the room name for an ID", async () => {
      const name = ROOM_NAMES[MAIN_ROOM]
      expect(name).to.equal('Main Room');
    });
});