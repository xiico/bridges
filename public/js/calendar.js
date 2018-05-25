$(document).ready(function () {
    var timer;
    $(document).on('mousemove', function(e){
       clearTimeout(timer);    
       timer = setTimeout(function() {
           $(`.help-text`).fadeOut('slow', function() {
                $(this).text(helpMessage[4].message);
           }).fadeIn();;
       }, 5000);
    });
    var localUtcOffset = moment().utcOffset()/60;
    window.calendarEvent = null;
    window.colors = {
        requested: '#f0ad4e', 
        accepted: '#5cb85c', 
        taught: '#337ab7', 
        block: '#2C1E4F', 
        canceled: '#d9534f', 
        archived: '#5E5E5E'
    }
    $('.timezone span').text(' (UTC' + moment().format('Z') + ')');
    $('#panel-participants').hide();
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right:  (isTeacher || isAdmin ? 'month,' : '') + 'agendaWeek,agendaDay,listWeek'
        },
        validRange: function(nowDate) {
            return {
                start: nowDate.subtract( isAdmin || isTeacher ? 100 : 1,'days'),
                end: nowDate.clone().add(1, 'years')
            };
        },
        minTime: getBusinessHours(startBusinessHours, endBusinessHours, timezone ? timezone.offset : localUtcOffset, localUtcOffset).start,
        maxTime: getBusinessHours(startBusinessHours, endBusinessHours, timezone ? timezone.offset : localUtcOffset, localUtcOffset).end,
        firstDay: isStudent ? new Date().getDay() : 0,
        //defaultDate: '2017-05-12',
        editable: owner.isTeacher,
        eventLimit: true, // allow "more" link when too many events
        selectable: owner.isTeacher,
        selectHelper: true,
        defaultView: 'agendaWeek',
        selectOverlap: false,
        nowIndicator: true,
        //timezone: timezone.utc[0],//'America/Sao_Paulo','America/Santiago','Europe/London'
        ignoreTimezone: false,
        eventDurationEditable: false,
        select: function (start, end) {
            var credits = Math.abs(new Date(end) - new Date(start)) / 60 / 1000 / 60;

            if (credits < 1 || credits > 4) {
                if (credits < 1) modalProblem('The min class duration is 01:00');
                if (credits > 4) modalProblem('The max class duration is 04:00');
                $('#calendar').fullCalendar('unselect');
                $('#bookClass').modal('show');
                return;
            }
            //var title = prompt('Event Title:');
            var title = isStudent ? 'Portuguese Class' : 'Blocked Timeslot';
            if (title) {
                window.calendarEvent = {
                    title: title,
                    start: moment(start.toISOString()).toISOString(),
                    end: moment(end.toISOString()).toISOString(),
                    participants: [userid],
                    owner: qid,
                    state: isStudent ? 'requested' : 'block'
                };

                if (moment(start.toISOString()) < moment()) {
                    modalProblem("This is not a valid date.");
                } else {
                    if (curCredits - credits >= 0 || isTeacher) {
                        if (isStudent) showEventInfoStudent(start, end, curCredits, credits);
                        else showEventInfoTeacher(start, end);
                    } else {
                        modalProblem("You don't have enough credits to book this class");
                    }
                }
                $('#bookClass').modal('show');

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
                            if (evt.owner) { 
                                evt.color = qid == evt.owner._id || qid == userid ? colors[evt.state] : '#290054';                                
				                evt.startEditable = (qid == evt.owner._id && qid != userid);
                            }
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
        }]*/ getBusinessHours(startBusinessHours, endBusinessHours, timezone ? timezone.offset : localUtcOffset, localUtcOffset),
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
            window.calendarEvent = calEvent;
            $('#infoClass').modal('show');
            // $('#myModal').data("event", JSON.stringify(calEvent));

            var credits = Math.abs(new Date(calEvent.end) - new Date(calEvent.start)) / 60 / 1000 / 60;
            // $('.info-event .date').text(calEvent.start.calendar(null, {
            //     sameDay: '[Today]',
            //     nextDay: '[Tomorrow]',
            //     nextWeek: 'dddd',
            //     lastDay: '[Yesterday]',
            //     lastWeek: '[Last] dddd',
            //     sameElse: 'DD/MM/YYYY'
            // }));
            // $('.info-event .start').text(calEvent.start.format('HH:mm'));
            // $('.info-event .end').text(calEvent.end.format('HH:mm'));
            // $('.info-event .cost').text(credits);
            // $('.info-event .curr-balance').text(curCredits);
            // $('.info-event .balance').text(curCredits - credits);
            showEventInfoStudent(calEvent.start, calEvent.end, curCredits, credits);            

            $('.info-event-student .state').text(classState(calEvent.state));

            if( qid != calEvent.owner._id) {
                $(".teacher-calendar").show();
                $(".teacher-calendar").prop("href", "/calendar/" + calEvent.owner._id)
            } else $(".teacher-calendar").hide();

            if(calEvent.state == 'requested') {
                $('.accept').show();
                $('.accept').prop('disabled',false);
            } else  $('.accept').hide();

            if(calEvent.state == 'requested' || calEvent.state == 'accepted') $('#infoClass .unbook').show();
            else $('#infoClass .unbook').hide();

            if (calEvent.state == 'requested' && (isTeacher || isAdmin)) $('.accept').show();
            $('#panel-participants').show();
            if(calEvent.participants){

                if(calEvent.participants[0].isStudent) {
                    $('.info-event-student').show();
                    $('.info-event-teacher').hide();
                } else {
                    $('.info-event-student').hide();
                    $('.info-event-teacher').show();
                }


                if (isTeacher){
                    $("#panel-participants tr").remove();                    
                    for (var i = 0, participant;participant = calEvent.participants[i]; i++){
                        $('#participants').append('<tr><td>'+i+'.</td><td>'+participant.name.first + ' ' + participant.name.last +'</td></tr>');
                    }
                } else {
                    $('.teacher-name').text(calEvent.owner.name.first + ' ' + calEvent.owner.name.last);
                }
            } else $('#panel-participants').hide();
            
        },
        eventAfterAllRender: function(){
            $(`.fc-v-event`).data(`help`, 1);
            $(`.fc-nonbusiness, .fc-bgevent`).addClass('show-help').data(`help`, 5);
            $(`body`).find('.show-help, a').hover(function(e) {
                var helpId = $(e.currentTarget).data('help');
                if(helpId !== undefined) $(`.help-text`).text(helpMessage[helpId].message);
                else $(`.help-text`).text(helpMessage[owner.isStudent ? 0 : 2].message);
            });
            $(`body`).find('.show-help, a').mouseleave(function(e){
                $(`.help-text`).text(helpMessage[owner.isStudent ? 0 : 2].message);
            });
        }
    });
});

function showEventInfoStudent(start, end, curCredits, credits){
    modalOK();
    $('.save-event .date').text(start.calendar(null, {
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        sameElse: 'DD/MM/YYYY'
    }));
    $('.save-event .start').text(start.format('HH:mm'));
    $('.save-event .end').text(end.format('HH:mm'));
    $('.save-event .cost').text(credits);
    $('.save-event .curr-balance').text(curCredits);
    $('.save-event .balance').text(curCredits - credits);
}

function showEventInfoTeacher(start, end){
    modalOK();
    $('.save-event .start').text(start.format('HH:mm'));
    $('.save-event .end').text(end.format('HH:mm'));
}

function classState(state) {
    //requested, accepted, active, canceled, archived
    switch (state) {
        case 'requested':
            return 'Waiting acceptance';
        case 'accepted':
            return 'Accepted';
        case 'taught':
            return 'Taught';
        case 'canceled':
            return 'Canceled';
        case 'archived':
            return 'Archived';
    }
}

function confirmUnbook(){
    var result = Math.abs(moment() - moment(window.calendarEvent.start.toISOString())) / 1000 / 60 / 60;
    var message = creditsMessageAlert(result);

    $('#confirmExclusion .alert').removeClass('alert-info');
    $('#confirmExclusion .alert').removeClass('alert-warning');
    $('#confirmExclusion .alert').removeClass('alert-danger');

    $('#confirmExclusion .alert').addClass(message.type);
    $('#confirmExclusion .message').text(message.message);
    //canceled
    $('#confirmExclusion').modal('show');
}

function creditsMessageAlert(timeOffset){
    if(timeOffset >= 24 || isTeacher) return {type: 'alert-info', message: 'All ' + (isTeacher ? 'the' : 'your') + ' credits will be refunded for this class.'};
    //if(timeOffset < 24 && timeOffset > 12) return {type: 'alert-warning', message: 'You will only be refunded half your credits.'};
    return {type: 'alert-danger', message: 'No credits will be refunded.'}; //if(result <= 12)
}

function modalOK(){
    $('.book-event').removeClass('hidden');
    $('.not-enough-credits').addClass('hidden');
    $('.modal-footer').removeClass('hidden');
}

function modalProblem(message){
    $('.book-event').addClass('hidden');
    $('.problem').removeClass('hidden');
    $('.modal-footer').addClass('hidden');
    $('.problem p').text(message);
}

function updateInfo(result) {
    /********/
    // evt.start = moment(evt.start);
    // if (evt.end) evt.end = moment(evt.end);
    /**********/

    result.event.start = moment(result.event.start);//.format('YYYY-MM-DDTHH:mm:ss');
    if (result.event.end) result.event.end = moment(result.event.end);//.format('YYYY-MM-DDTHH:mm:ss');
    if (!result.event.newEvent) $('#calendar').fullCalendar('removeEvents', calendarEvent.id || calendarEvent._id);
    result.event.color = colors[result.event.state]
    calendarEvent = result.event;
    $('#calendar').fullCalendar('renderEvent', result.event, true); // stick? = true
    curCredits = result.credits;
    $('.credits span').text(curCredits);
    if (curCredits)
        $.notify({
            title: '<strong>Success!</strong>',
            message: result.message
        }, { type: 'success' });
    if (result.event.state == 'requested') {
        $('.accept').show();
        $('.accept').prop('disabled', false);
    } else $('.accept').hide();
    $('#infoClass').modal('hide');
}

function saveCalendarEvent(){                
    saveEvent(calendarEvent, updateInfo);
}

function saveEvent(event, callback) {
    $.post("/calendarevent/create", event).done(callback);
}

function updateEvent(event, callback) {
    $.post("/calendarevent/update", event).done(callback);
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