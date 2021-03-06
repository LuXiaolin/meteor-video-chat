    VideoCallServices = {
        VideoChatCallLog: new Meteor.Collection("VideoChatCallLog")
    };
    /*
     *   Allow users to update the connection data collection from the client side
     *   In a stable release there will be greater control of the people who can edit this. 
     *
     */
    VideoCallServices.VideoChatCallLog.allow({
        update: function(id, originalEntry, fieldBeingUpdated, query) {
            return Meteor.userId() == originalEntry.callee_id || Meteor.userId() == originalEntry.caller_id;

        },
        insert: function(id, entry) {
            if (Meteor.user()) {
                let callee = entry.callee_id;
                let calleeInCall = VideoCallServices.VideoChatCallLog.findOne({
                    callee_id: callee,
                    status: {
                        $in: ["R", "A", "CON"]
                    }
                })
                let callMadeButDesposedOf = VideoCallServices.VideoChatCallLog.findOne({
                    callee_id: callee,
                    status: "C"
                })
                if (callMadeButDesposedOf) {
                    VideoCallServices.VideoChatCallLog.update({
                        _id: callMadeButDesposedOf._id
                    }, {
                        $set: {
                            status: "F"
                        }
                    })
                }
                if (calleeInCall) {
                    throw new Meteor.Error(500, "Callee is currently in a call");
                    return false;
                }
                else return true;
            }
            else return false;
        }
    })