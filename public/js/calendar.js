$(document).ready(function () {
    $('#panel-participants').hide();
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,listWeek'
        },
        defaultDate: '2017-05-12',
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        selectable: true,
        selectHelper: true,
        select: function (start, end) {
            var title = prompt('Event Title:');
            var eventData;
            if (title) {
                eventData = {
                    title: title,
                    start: start,
                    end: end
                };
                $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
            }
            $('#calendar').fullCalendar('unselect');
        },
        //events: []
        eventSources: [
            // your event source
            {
                url: '/calendardata',
                type: 'GET',
                data: {
                    userid: userid,
                    //custom_param2: 'somethingelse'
                },
                success: function(data){
                    //alert(JSON.stringify(data));
                },
                error: function () {
                    alert('there was an error while fetching events!');
                },
                color: '#3a87ad',   // a non-ajax option
                textColor: 'white' // a non-ajax option
            }
        ],
        businessHours: {
            start: '08:00',
            end: '20:00',
            dow: [1, 2, 3, 4, 5, 6]
        },
        selectConstraint: {
            start: '08:00',
            end: '20:00',
            dow: [1, 2, 3, 4, 5, 6]
        },
        eventConstraint: {
            start: '08:00',
            end: '20:00',
            dow: [1, 2, 3, 4, 5, 6]
        },
        eventOverlap: function (stillEvent, movingEvent) {
            return stillEvent.allDay && movingEvent.allDay;
        },
        dayRender: function (date, cell) {
            if (date > new Date('2017-05-25')) {
                $(cell).addClass('disabled');
            }
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
            // $('#myModal').modal('show');
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
function saveData() {
    var evt = JSON.parse($('#myModal').data("event"))
    saveMyData(evt)
}
function saveMyData(event) {
    jQuery.post(
        '/event/save',
        {
            title: event.title,
            start: event.start,
            end: event.end
        }
    );
}