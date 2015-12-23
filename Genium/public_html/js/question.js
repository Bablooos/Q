// Question
// select-answer questions
//

export function makeQuestion( parent ) {
    var myQuestion = {id: 0};
    var qTimeout = 0;               // Handler ID for timeout

    // Preparing visual objects for answering
    var box = createelement( 'elephant-question' );
    box.innerHTML = `
        <div class="qtitle"></div>
        <div class="qqblock">
         <div class="qtheme"></div>
         <div class="qimage"></div>
         <div class="qtext"></div>
        </div>
        <div class="qanswers">
         <div class="qanswer" data-answer="1"></div>
         <div class="qanswer" data-answer="2"></div>
         <div class="qanswer" data-answer="3"></div>
         <div class="qanswer" data-answer="4"></div>
         <div class="qanswer" data-answer="5"></div>
         <div class="qanswer" data-answer="6"></div>
         <div class="qanswer" data-answer="7"></div>
        </div>
        <div class="qcomment"></div>
        <div class="qpool"></div>
        <div class="qtimer"></div>
        <button class="mybutton">Continue</button>
    `;
    parent.appendChild( box );
    var title = box.querySelector( '.qtitle' );
    var theme = box.querySelector( '.qtheme' );
//    var image = box.querySelector( '.qimage' );
    var text = box.querySelector( '.qtext' );
    var timer = box.querySelector( '.qtimer' );
    var comment = box.querySelector( '.qcomment' );
    var continuebutton = box.querySelector( 'button' );
    continuebutton.myhandler = docontinue;

    var answers = [];

    for( var i = 7; i--; ) {
        answers[i] = box.querySelector( '.qanswer[data-answer="' + (i + 1) + '"]' );
        answers[i].myhandler = useranswer;
    }

    // Handling server data
    Client.listen( 'question', setQuestion );

    // Try to load current question from storage
    var keeped = sessionStorage['myQuestion'];
    keeped = keeped && JSON.parse( keeped );
    // Show stored question
    if( keeped && Date.now() < keeped.timetill + 3000 )
        setQuestion( keeped, true );
    // Reask question if current is timed out
    if( !keeped || !keeped.timetill || Date.now() > keeped.timetill ) {
        Client.toserver( 'question' );
    }

    function setQuestion( data, dontstore ) {
        console.log( data );
        function revise( str, o ) {
            var val = str in data? data[str] : '';
            myQuestion[str] = val;
            o.textContent = val;
        }

        if( myQuestion.id !== data.id ) {
            myQuestion = {id: data.id, answer: 0};
            revise( 'title', title );
            revise( 'theme', theme );
            revise( 'question', text );
            myQuestion.answers = data['answers'];
            for( var i = 7; i--; ) {
                answers[i].textContent = data.answers[i] || '';
                answers[i].classList.remove( 'myanswer', 'correctanswer' );
            }
            var now = Date.now();
            if( 'timetill' in data )
                myQuestion.timetill = data['timetill'];
            else
                myQuestion.timetill = now + 15000;

            if( 'timetotal' in data )
                myQuestion.timetotal = data['timetotal'];


            if( ('timeleft' in data) && !('timetill' in myQuestion) )
            {
                // Update time only if this is first ask
                myQuestion.timetill = now + data['timeleft'];
            }
        }

        // Block with correct answer
        if( 'answer' in data ) {
            var r = data['answer'];
            myQuestion.answer = r;
            if( r && answers[r-1] )
                answers[r-1].classList.add( 'correctanswer' );
        }

        if( 'myanswer' in data ) {
            var r = data['myanswer'];
            myQuestion.myanswer = r;
            if( r && answers[r-1] )
                answers[r-1].classList.add( 'myanswer' );
        }

        revise( 'comment', comment );

        if( myQuestion.answer ) {
            if( qTimeout )
                clearTimeout( qTimeout );
            qTimeout = 0;
            // Hide timer, show comment
        }
        else
        {
            if( now < myQuestion.timetill ) {
                // Show decreasing timer
                myQuestion.timetotal = myQuestion.timetotal || 15000;
                var left = myQuestion.timetill - now;
                timer.style.transition = 'none';
                timer.style.backgroundSize = left / myQuestion.timetotal * 100 + '%';
                setTimeout( function() {
                    timer.style.transition = 'background-size ' + (left) + 'ms linear';
                    timer.style.backgroundSize = '0';
                }, 30 );

                // Set endofanswertime event
                qTimeout = setTimeout( questionTimeout, myQuestion.timetill - now );
            }
        }

        checkAnswering();
        if( !dontstore ) storeSession();
    }

    function storeSession() {
        sessionStorage['myQuestion'] = JSON.stringify( myQuestion );
    }

    function checkAnswering() {
        box.classList.toggle( 'cananswer', myQuestion.id && !myQuestion.answer && !myQuestion.stopped );
        box.classList.toggle( 'answerisknown', myQuestion.answer>0 );
        box.classList.toggle( 'answered', myQuestion.myanswer );
        continuebutton.hidden = !myQuestion.answer;
    }

    function questionTimeout( e ) {
        qTimeout = 0;
        if( myQuestion.answer || myQuestion.stopped )
            return;             // Already completed (timeouted)
        myQuestion.stopped = true;
        checkAnswering();

        Client.toserver( 'question', 'timeout=1' );
    }

    function useranswer( e ) {
        if( myQuestion.answer || myQuestion.stopped )
            return;
        var o = e.target;
        if( !('answer' in o.dataset) ) return;
        var ansno = o.dataset['answer'];
        myQuestion.myanswer = ansno;
        myQuestion.stopped = true;
        o.classList.add( 'myanswer' );
        checkAnswering();
        storeSession();
        Client.toserver( 'question', 'action=answer&q=' + myQuestion['id'] + '&answer=' + ansno );
    }

    function docontinue() {
        // Если текущий вопрос завершен (показан верный ответ), то запрашиваем следующий
        if( !myQuestion.answer ) return;
        continuebutton.hidden = true;
        Client.toserver( 'question', 'action=next' );
    }

    return {
    };
}


//Client.push( '[ "question", {\
//        "id": 1,\
//        "title": "First Question",\
//        "theme": "Novice",\
//        "text":  "Do you want to play with me?",\
//        "answers": ["Yes", "No", "Who Are You?", "Invite Friends!" ],\
//        "timetotal": 25000,\
//        "timeleft": 15000\
//}]' );
