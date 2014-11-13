/**
 * jspsych-survey-textarea
 *
 * Addaptation of Josh de Leeuw's jspsych-survey-text by Davi Alves Oliveira
 * 
 * Substitution of "input" tag for "textarea"
 *
 */

(function($) {
    jsPsych['survey-textarea'] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.pluginAPI.enforceArray(params, ['data']);
            
            var trials = [];
            for (var i = 0; i < params.questions.length; i++) {
                trials.push({
                    type: "survey-textarea",
                    questions: params.questions[i],
                    data: (typeof params.data === 'undefined') ? {} : params.data[i]
                });
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);

            // add likert scale questions
            for (var i = 0; i < trial.questions.length; i++) {
                // create div
                display_element.append($('<div>', {
                    "id": 'jspsych-survey-textarea-' + i,
                    "class": 'jspsych-survey-textarea-question'
                }));

                // add question text
                $("#jspsych-survey-textarea-" + i).append('<p class="jspsych-survey-textarea">' + trial.questions[i] + '</p>');

                // add textarea
                $("#jspsych-survey-textarea-" + i).append('<textarea name="#jspsych-survey-textarea-response-' + i + '"></textarea>');
            }

            // add submit button
            display_element.append($('<button>', {
                'id': 'jspsych-survey-textarea-next',
                'class': 'jspsych-survey-textarea'
            }));
            $("#jspsych-survey-textarea-next").html('Submit Answers');
            $("#jspsych-survey-textarea-next").click(function() {
                // measure response time
                var endTime = (new Date()).getTime();
                var response_time = endTime - startTime;

                // create object to hold responses
                var question_data = {};
                $("div.jspsych-survey-textarea-question").each(function(index) {
                    var id = "Q" + index;
                    var val = $(this).children('textarea').val();
                    var obje = {};
                    obje[id] = val;
                    $.extend(question_data, obje);
                });

                // save data
                block.writeData($.extend({}, {
                    "trial_type": "survey-textarea",
                    "trial_index": block.trial_idx,
                    "rt": response_time
                }, question_data, trial.data));

                display_element.html('');

                // next trial
                block.next();
            });

            var startTime = (new Date()).getTime();
        };

        return plugin;
    })();
})(jQuery);
