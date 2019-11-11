let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./index').app;
let should = chai.should();

const { 
    LABEL_ROOM,
    ADMIN_ROOM,
    ARTIST_ROOM,
    MAIN_ROOM,
    TEST_ROOM,
} = process.env;

chai.use(chaiHttp);

describe('Integration: /diagnostic', () => {
    it('it should initiate the playlist update when a request is made to make-playlist', (done) => {
        chai.request(server)
        .get('/diagnostic')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.response.should.be.a('string');
            done();
        });
    });
});  

describe('Integration: /make-playlist', () => {
    it('it should initiate the playlist update when a request is made to make-playlist', (done) => {
        chai.request(server)
        .get('/make-playlist')
        .end((err, res) => {
            const checkObj = {};
            res.should.have.status(200);
            res.body.should.be.eql(checkObj);
            done();
        });
    });
});  

describe('Integration: /new-message', () => {
    it('it should send a message when it recieves a formatted message', (done) => {
        chai.request(server)
            .post('/new-message')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                "message": {
                    "text": "hey luvbot whos your father?",
                    "from": {
                        "first_name": "test",
                        "last_name": "test"
                    },
                    "chat": {
                        "id": MAIN_ROOM
                    }
                }
            })
        .end((err, res) => {
            const checkObj = {};
            res.should.have.status(200);
            res.body.should.be.eql(checkObj);
            done();
        });
    });
});  