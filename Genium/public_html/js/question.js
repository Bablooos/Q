/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Question( parent ) {

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

    // Handling server data
    function handle( data ) {

    }

    return {

    };
};
