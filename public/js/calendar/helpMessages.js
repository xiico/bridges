var helpMessage = [{
    id: 0,
    message: `Here you can review your classes` + (isStudent ? `, but you need to go to teacher's calendar page to change them.` : ``)
}, {
    id: 1,
    message: `A booked class.\r\n(click for details)`
}, {
    id: 2,
    message: `Here is ` + (isStudent ?  `the teacher` : `your`)  + ` calendar, you can ` + (isStudent ?  `book new classes` : `accept new classes`)  + ` or change them.`
}, {
    id: 3,
    message: `This class has been canceled, you can't change it.`
}, {
    id: 4,
    message: `Click or touch a free box in the calendar to ` + (isStudent ? `start booking your classes!` : `prevent students from booking them`)
}, {
    id: 5,
    message: `This time slot has been taken, ` + (isStudent ?  `you` : `students`)  + ` can't book classes that overlap it!`
},]