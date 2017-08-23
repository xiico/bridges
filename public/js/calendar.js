$(document).ready(function () {
    var localUtcOffset = moment().utcOffset()/60;
    $('.timezone span').text(' (UTC' + moment().format('Z') + ')');
    $('#panel-participants').hide();
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,listWeek'
        },
        defaultDate: '2017-05-12',
        editable: owner.isTeacher,
        eventLimit: true, // allow "more" link when too many events
        selectable: owner.isTeacher,
        //selectHelper: true,
        defaultView: 'agendaWeek',
        selectOverlap: false,
        //timezone: timezone.utc[0],//'America/Sao_Paulo','America/Santiago','Europe/London'
        ignoreTimezone: false,
        eventDurationEditable: false,
        select: function (start, end) {
            var title = prompt('Event Title:');
            var eventData;
            if (title) {
                eventData = {
                    title: title,
                    start: moment(start.toISOString()).toISOString(),
                    end: moment(end.toISOString()).toISOString(),
                    participants: [userid],
                    owner: qid
                };
                
                saveEvent(eventData, function(event){
                    event.start = moment(event.start).format('YYYY-MM-DDTHH:mm:ss');
                    if(event.end) event.end = moment(event.end).format('YYYY-MM-DDTHH:mm:ss');
                    $('#calendar').fullCalendar('renderEvent', event, true); // stick? = true
                    //$('.credits span').text(' (UTC' + moment().format('Z') + ')');
                });
            }
            $('#calendar').fullCalendar('unselect');
        },
        eventRender: function(event, el) {
            // render the timezone offset below the event title
            if (event.start.hasZone()) {
                el.find('.fc-title').after(
                    $('<div class="tzo"/>').text(event.start.format('Z'))
                );
            }
        },
        //events: []
        eventSources: {
            events: function (start, end, timezone, callback) {
                // your event source
                $.ajax({
                    url: '/calendardata',
                    type: 'GET',
                    data: {
                        userid: qid,
                        //custom_param2: 'somethingelse'
                    },
                    success: function (data) {
                        //alert(JSON.stringify(data));
                        //moment().tz(timezone).format();
                        var tz = timezone;
                        data.forEach(function (evt, index) {
                            evt.start = moment(evt.start);
                            if (evt.end) evt.end = moment(evt.end);
                            //if((evt.owner && evt.owner === uid) || (!(evt.participants && evt.participants.some(function (p) { return p._id === uid })))) evt.color = '#3a87ad';
                        });
                        callback(data);
                    },
                    error: function (err) {
                        alert('there was an error while fetching events!');
                    }
                })
            },
            color: '#3a87ad',//'#b72a00',   // a non-ajax option
            textColor: 'white', // a non-ajax option
        },
        businessHours: /*[{
            start: startBusinessHours + ':00',//08:00
            end:  endBusinessHours + ':00',//20:00
            dow: [1, 2, 3, 4, 5, 6]
        },{
            start: '17:00',//08:00
            end: '20:00',//20:00
            dow: [1, 2, 3, 4, 5, 6]
        }]*/ getBusinessHours(startBusinessHours, endBusinessHours, timezone.offset, localUtcOffset),
        // selectConstraint: {
        //     start: '04:00',
        //     end: '16:00',
        //     dow: [1, 2, 3, 4, 5, 6]
        // },
        selectConstraint: 'businessHours',
        eventConstraint: 'businessHours',
        eventOverlap: function (stillEvent, movingEvent) {
            return stillEvent.allDay && movingEvent.allDay;
        },
        eventDrop: function (event, delta, revertFunc) {
            alert(event.title + " was dropped on " + event.start.format());
            if (!confirm("Are you sure about this change?")) {
                revertFunc();
            }
        },
        eventResize: function (event, delta, revertFunc) {
            alert(event.title + " end is now " + event.end.format());
            if (!confirm("is this okay?")) {
                revertFunc();
            }
        },
        eventClick: function (calEvent, jsEvent, view) {
            //- alert('Event: ' + calEvent.title);
            //- alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
            //- alert('View: ' + view.name);
            // change the border color just for fun
            //$(this).css('border-color', 'red');

            // alert(JSON.stringify(calEvent));
            // $('#title').val(calEvent.title);
            // $('#start').text(calEvent.start);
            // $('#end').text(calEvent.end);
            $('#myModal').modal('show');
            // $('#myModal').data("event", JSON.stringify(calEvent));

            if(calEvent.participants){
                $("#panel-participants tr").remove();
                $('#panel-participants').show();
                for (var i = 0, participant;participant = calEvent.participants[i]; i++){
                    $('#participants').append('<tr><td>'+i+'.</td><td>'+participant.name.first + ' ' + participant.name.last +'</td></tr>');
                }
            } else $('#panel-participants').hide();
            
        }
    });
});

function saveEvent(event, callback) {
    $.post("/calendarevent/create", event).done(callback);
}

function getBusinessHours(bos, boe, originalUTCOffset, localUTCOffset) {
    var start = parseInt(bos);
    var end = parseInt(boe);

    var startLocal = start - originalUTCOffset + localUTCOffset;
    var endLocal = end - originalUTCOffset + localUTCOffset;

    if (startLocal >= 0 && startLocal <= 24 &&
        endLocal >= 0 && endLocal <= 24) {
        return {
            start: offSetToTime(startLocal).substring(1),//08:00
            end: offSetToTime(endLocal).substring(1),//20:00
            dow: [1, 2, 3, 4, 5, 6]
        }
    } else {
        if (endLocal > 24) {
            var bh = [];
            bh.push(
                {
                    start: offSetToTime(startLocal).substring(1),//08:00
                    end: offSetToTime(24).substring(1),//20:00
                    dow: [1, 2, 3, 4, 5, 6]
                }
            );
            bh.push(
                {
                    start: offSetToTime(0).substring(1),//08:00
                    end: offSetToTime((endLocal-24)).substring(1),//20:00
                    dow: [1, 2, 3, 4, 5, 6]
                }
            );
            return bh;
        }
    }
}