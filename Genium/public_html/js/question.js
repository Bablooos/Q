/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Client */

Client.setObject( 'question', function( parent ) {

    // Preparing visual objects for answering
    var box = createelement( 'elephant_questionbox' );
    box.innerHTML = '\
        <div class="elephant_question_title"></div>\
        <div class="elephant_question_theme"></div>\
        <div class="elephant_question_image"></div>\
        <div class="elephant_question_text"></div>\
        <div class="elephant_question_answers"</div>\
        ';
    parent.appendChild( box );
    var title = box.querySelector( '.elephant_question_title' );
    var theme = box.querySelector( '.elephant_question_theme' );
    var image = box.querySelector( '.elephant_question_image' );
    var text  = box.querySelector( '.elephant_question_text' );

    // Handling server data
    Client.listen( 'question', function( data ) {
        function revise( str, o ) {
            if( str in data ) o.textContent = data[str];
        }
        revise( 'title', title );
        revise( 'theme', theme );
        revise( 'text', text );
    });

    return {

    };
});
