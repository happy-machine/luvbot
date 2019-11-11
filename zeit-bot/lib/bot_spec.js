import { expect, should, assert } from "chai";
import { checkIntent, makeTelMsg } from "./bot";
import * as vocab from './vocab';
should();

const input = 'hey luvbot whats happening';

describe("checkIntent", async () => {
  it("should return true when a memeber of the target array is found in the input string", async () => {
    const result = checkIntent(input, vocab.robotHailsIn)
    expect(result).to.be.true;
  });
  it("should return false when word/array 1 and word/array 2 are not found when fourth argument is true", async () => {
    const result = checkIntent(input, 'hey', 'boomstop', vocab.AND)
    expect(result).to.be.false;
  });
  it("should return true when word/array 1 and word/array 2 are found when fourth argument is true", async () => {
    const result = checkIntent(input, 'hey', 'luvbot', vocab.AND)
    expect(result).to.be.true;
  });
});

describe("makeTelMsg", async () => {
    it("should return body.type as 'photo' when body.content contains 'png'", async () => {
      const body = makeTelMsg('get blah.png')
      expect(body.type).to.equal('photo');
    });
  });