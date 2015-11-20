/**
 * jspsych-survey-keylogging
 * a jspsych plugin for free response survey questions with keylogging
 *
 * Davi Alves Oliveira
 * 
 * based on jspsych-survey-text
 * 
 * Josh de Leeuw
 *
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-survey-text
 *
 */

(function($) {
    jsPsych['survey-keylogging'] = (function() {

        var plugin = {};
        var shortPause;
        var longPause;
        
        plugin.create = function(params) {

            params = jsPsych.pluginAPI.enforceArray(params, ['data']);
            
            shortPause = (params.short_pause || 250);
            longPause = shortPause * 10;

            var trials = [];
            for (var i = 0; i < params.questions.length; i++) {
                trials.push({
                    questions: params.questions[i]
                });
            }
            return trials;
        };

        plugin.trial = function(display_element, trial) {
        	
        	var keylog = {};
	        var processedData = "";
	        var first = true;
	        var now;
	    	var previousTime;
	        var shiftDown = false;
			var accentuation = 0;
			var keys = {8:"<span class=\"glyphicon glyphicon-step-backward text-danger small\"></span>", 
						9:"<kbd class=\"bg-primary small\">Tab</kbd>", 
						13:"<span class=\"text-info\">&para;</span>",
						17:"<kbd class=\"bg-primary small\">Ctrl</kbd>",
						18:"<kbd class=\"bg-primary small\">Alt</kbd>", 
						20:"<kbd class=\"bg-primary small\">Caps Lock</kbd>",
						"^20":"<kbd class=\"bg-primary small\">Caps Lock</kbd>",
						27:"<kbd class=\"bg-primary small\">Esc</kbd>", 
						32:"&middot;",
						"^32":"&middot;",
						33:"<kbd class=\"bg-primary small\">Page Up</kbd>",
						34:"<kbd class=\"bg-primary small\">Page Down</kbd>",
						35:"<kbd class=\"bg-primary small\">End</kbd>",
						36:"<kbd class=\"bg-primary small\">Home</kbd>",
						37:"<span class=\"glyphicon glyphicon-arrow-left text-info small\"></span>", 
						38:"<span class=\"glyphicon glyphicon-arrow-up text-info small\"></span>", 
						39:"<span class=\"glyphicon glyphicon-arrow-right text-info small\"></span>", 
						40:"<span class=\"glyphicon glyphicon-arrow-down text-info small\"></span>", 
						46:"<span class=\"glyphicon glyphicon-step-forward text-danger small\"></span>", 
						48:"0", 
						"^48":")", 
						49:"1", 
						"^49":"!", 
						50:"2", 
						"^50":"@", 
						51:"3", 
						"^51":"#", 
						52:"4", 
						"^52":"$", 
						53:"5", 
						"^53":"%", 
						54:"6", 
						"^54":"&#776;", 
						55:"7", 
						"^55":"&", 
						56:"8", 
						"^56":"*", 
						57:"9", 
						"^57":"(", 
						65:"a", 
						"^65":"A", 
						66:"b", 
						"^66":"B", 
						67:"c", 
						"^67":"C", 
						68:"d", 
						"^68":"D", 
						69:"e", 
						"^69":"E", 
						70:"f", 
						"^70":"F", 
						71:"g", 
						"^71":"G", 
						72:"h", 
						"^72":"H", 
						73:"i", 
						"^73":"I", 
						74:"j", 
						"^74":"J", 
						75:"k", 
						"^75":"K", 
						76:"l", 
						"^76":"L", 
						77:"m", 
						"^77":"M", 
						78:"n", 
						"^78":"N", 
						79:"o", 
						"^79":"O", 
						80:"p", 
						"^80":"P", 
						81:"q", 
						"^81":"Q", 
						82:"r", 
						"^82":"R", 
						83:"s", 
						"^83":"S", 
						84:"t", 
						"^84":"T", 
						85:"u", 
						"^85":"U", 
						86:"v", 
						"^86":"V", 
						87:"w", 
						"^87":"W", 
						88:"x", 
						"^88":"X", 
						89:"y", 
						"^89":"Y", 
						90:"z", 
						"^90":"Z",
						91:"<kbd class=\"bg-primary small\">Windows</kbd>",
						93:"<kbd class=\"bg-primary small\">Menu</kbd>",
						112:"<kbd class=\"bg-primary small\">F1</kbd>",
						113:"<kbd class=\"bg-primary small\">F2</kbd>",
						114:"<kbd class=\"bg-primary small\">F3</kbd>",
						115:"<kbd class=\"bg-primary small\">F4</kbd>",
						117:"<kbd class=\"bg-primary small\">F6</kbd>",
						118:"<kbd class=\"bg-primary small\">F7</kbd>",
						119:"<kbd class=\"bg-primary small\">F8</kbd>",
						120:"<kbd class=\"bg-primary small\">F9</kbd>",
						121:"<kbd class=\"bg-primary small\">F10</kbd>",
						122:"<kbd class=\"bg-primary small\">F11</kbd>",
						123:"<kbd class=\"bg-primary small\">F12</kbd>", 
						186:"ç", 
						"^186":"Ç", 
						187:"=", 
						"^187":"+", 
						188:",", 
						"^188":"<", 
						189:"-", 
						"^189":"_", 
						190:".", 
						"^190":">", 
						191:";", 
						"^191":":", 
						192:"'", 
						"^192":"\"", 
						193:"/",
						"^193":"?",
						219:"<kbd class=\"bg-primary small\">&#180;</kbd>",
						"^219":"<kbd class=\"bg-primary small\">`</kbd>", 
						220:"]", 
						"^220":"}", 
						221:"[", 
						"^221":"{",
						222:"<kbd class=\"bg-primary small\">~</kbd>",
						"^222":"<kbd class=\"bg-primary small\">^</kbd>",
						226:"<kbd class=\"bg-primary small\">\</kbd>",
						"^226":"<kbd class=\"bg-primary small\">|</kbd>"};

            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);

            // add likert scale questions
            for (var i = 0; i < trial.questions.length; i++) {
                // create div
                display_element.append($('<div>', {
                    "id": 'jspsych-survey-keylogging-' + i,
                    "class": 'jspsych-survey-keylogging-question col-lg-12'
                }));

                // add question text
                $("#jspsych-survey-keylogging-" + i).append('<p class="jspsych-survey-keylogging">' + trial.questions[i] + '</p>');

                // add textarea
                $("#jspsych-survey-keylogging-" + i).append('<textarea id="jspsych-survey-keylogging-response-' + i + '" name="#jspsych-survey-keylogging-response-' + i + '" class="form-control"></textarea>');
                
                //keylogging
				$(document).on("keyup", "body", function(e){
				      if(e.which === 16){
				      	shiftDown = false;
				      }
				});
                
                $(document).on("keydown", "#jspsych-survey-keylogging-response-" + i, function(e){
					console.log(e.which);
					
                	if(e.which === 20){
						if(shiftDown == false){
				      		shiftDown = true;
						} else{
							shiftDown = false;
						}
					}
					
					
					if(e.which !== 16 && e.which !== 229){
                		now = (new Date()).getTime();
                		keylog[now] = keys[(shiftDown ? "^" : "") + e.which];
						
                		//processed keylogging data
	            		if(first){
	            			processedData += keylog[now];
	            			previousTime = now;
	            			first = false;
	            		}
	            		else{
	            			time = now - previousTime;
	            			processedData += "<span title='" + time + "'>" + Array(Math.floor(time/(time < longPause ? shortPause : longPause)) + 1).join((time < longPause ? "<span class=\"glyphicon glyphicon-time small text-warning\"></span>" : "<span class=\"glyphicon glyphicon-hourglass small text-danger\"></span>")) + "</span>" + keylog[now];
	            			previousTime = now;
	            		}
	                } else if(e.which === 16){
				      shiftDown = true;
					}
                });
            }
            
            // add submit button
            display_element.append($('<div>', {
                'id': 'jspsych-survey-keylogging-next-container',
                'class': 'jspsych-survey-keylogging col-lg-12 text-center'
            }));
			
			$("#jspsych-survey-keylogging-next-container").append("<br />");
			
			$("#jspsych-survey-keylogging-next-container").append($('<button>', {
                'id': 'jspsych-survey-keylogging-next',
                'class': 'jspsych-survey-keylogging btn btn-default'
            }));
			
            $("#jspsych-survey-keylogging-next").html('Enviar');
            $("#jspsych-survey-keylogging-next").click(function() {
                // measure response time
                var endTime = (new Date()).getTime();
                var response_time = endTime - startTime;

                // create object to hold responses
                var question_data = {};
                $("div.jspsych-survey-keylogging-question").each(function(index) {
                    var id = "Q" + index;
                    var val = $(this).children('textarea').val();
                    var obje = {};
                    obje[id] = val;
                    $.extend(question_data, obje);
                });

                // save data
                jsPsych.data.write($.extend({}, {
                    "rt": response_time,
                    "responses": JSON.stringify(question_data),
                    "keylog_raw": keylog,
                    "keylog_processed": "<p class='keylog-processed'>" + processedData + "</p>"
                }, trial.data));

                display_element.html('');

				// next trial
				if(trial.timing_post_trial > 0){
					setTimeout(function(){ jsPsych.finishTrial(); }, trial.timing_post_trial);
				} else {
					jsPsych.finishTrial();
				}
            });

            var startTime = (new Date()).getTime();
        };

        return plugin;
    })();
})(jQuery);
