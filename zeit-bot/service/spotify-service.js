import { colours } from '../constants';

function spotObj (status,track_name,artist_name,uri,album_id) {
    this.artist_name= artist_name;
    this.track_name= track_name;
    this.album_id= album_id;
    this.uri= uri;
    this.label=null;
    this.tracks_total=null;
    this.release_date= null;
    this.added_date='';
    this.status= { text:null , colour:null };
    this.res = {};
    this.to_be_added=null;
    this.to_be_logged=null;
    this.check_within_month = () => this.release_date + this.added_date,
    this.check_added_within_week = () => this.release_date + this.added_date,
    this.checkthis = (arg) => {
        this.uri=arg; 
        return this.uri;
    };
    this.set_status = () => {
        results=[]
        if ((todaysDate() > this.release_date) && (todaysDate() - this.release_date) >= 2505600000) { 
            // CHECK IF OVER A MONTH OLD
           this.status.text = "Older than a month";
           this.status.colour = colours.FgRed;
           this.to_be_added = false;
           this.to_be_logged = false;
           oldLabels += `${this.label}, Added: ${this.added_date.toString().substring(0,10)}, Released: ${this.release_date.toString().substring(0,10)}. `;
        } else if (this.added_date - this.release_date > 1866240000) {
            // IS THERE OVER A WEEK BETWEEN ADDED AND RELEASE DATE?
            if(this.tracks_total >= 8) {
                this.status.text = "Older than 1 Week but added as Album Track.";
                this.status.colour = colours.FgGreen;
                this.to_be_added = true;
                this.to_be_logged = 5;
            } else if (this.added_date  == todaysDate()) {
                this.status.text = "Added today but over a week old so not added.";
                this.status.colour = colours.FgRed;
                this.to_be_logged = 3;
                this.to_be_added =false;
            };
              //WAS IT ADDED TODAY?      
        } else  if (this.added_date >= todaysDate()) {
            this.status.text = "ADDED TODAY.";
            this.status.colour = colours.FgGreen;
            this.to_be_added = true;
            this.to_be_logged = 2;
            if (this.added_date == this.release_date){
                this.status.text = "NEW TODAY!";
                this.status.colour = colours.FgGreen;
                this.to_be_added = true;
                this.to_be_logged = 1;
            };
        } else if (this.release_date > todaysDate()) {
            this.status.text = "Date field incorrectly shows "+this.release_date.toString().substring(0,10)+".";
            this.status.colour = colours.FgRed;
            this.to_be_added = true;
            this.to_be_logged = 5 ; 
        } else {
            this.status.text = "Within a month old";
            this.status.colour = colours.FgWhite;
            this.to_be_added = true;
            this.to_be_logged = false;
        };

        if (!this.label && this.status.text !== 'undefined') {
            this.status.text = "No label Metadata";
            this.status.colour = colours.FgRed;
            this.to_be_logged = 6;
        };

        if (this.status.text && (!this.status.text == 'Empty' || this.status.text.indexOf('error') !== -1 || this.status.text.indexOf('Error') !== -1)) {
            this.status.colour=colours.FgRed;
            this.to_be_added=false;
            this.to_be_logged=7;
        };

        if ((!this.track_name || !this.artist_name || !this.uri || !this.album_id) && this.status.text !=='undefined') {
            this.status.text="MetaData filed incorrectly";
            this.to_be_logged=8;
            this.status.colour = colours.FgRed
        }; 
    };
};

export { spotObj };