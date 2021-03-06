// Copyright (c) 2013, salesforce.com, inc.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are permitted provided
// that the following conditions are met:
//
//     Redistributions of source code must retain the above copyright notice, this list of conditions and the
//     following disclaimer.
//
//     Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
//     the following disclaimer in the documentation and/or other materials provided with the distribution.
//
//     Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
//     promote products derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
// PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
// TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
(function ($$){

    var sr, mobile, postType, thumbnailUrl,namespaces=[];

    myPublisher = {

        init : function(signedRequest, isMobile) {
            sr = signedRequest;
            mobile = isMobile;
        },
        
        // tracks the namespaces
        getNamespaces: function(){
        	return namespaces;
        },
        
        addNamespace: function(namespace){
        	if (!$$.isNil(namespace)){
            	namespaces[namespaces.length] = namespace;
        	}
            myPublisher.updateContent();
            $$.byId('namespace').value = "";
        },
        
        removeNamespace: function(namespace){
        	var index = $$.indexOf(namespaces,namespace);
        	if (!$$.isNil(namespace) && index>=0){
        		namespaces.splice(index,1);
        	}
            myPublisher.updateContent();
        },
        
        clearPostTypes : function() {
        	namespaces = [];
        },

        // Simply display incoming events in order
        logEvent : function(name) {
        	console.log("Received event:" + name);
        },

        updateContent : function() {
        	var html="";
        	for (index in namespaces){
        		html+=namespaces[index] + " <a href=\"#\" onclick=\"myPublisher.removeNamespace('" + namespaces[index] + "')\">Remove</a><br>";
        	}
            $$.byId('namespaces').innerHTML = html;
            // Let the publisher know if we can share the post.
            $$.client.publish(sr.client, {name : "publisher.setValidForSubmit", 
            	payload : (namespaces.length>0)});
        },

        handlers : function() {

            var handlers = {
                onSetupPanel : function (payload) {
                    myPublisher.logEvent("setupPanel");
                },
                onShowPanel : function(payload) {
                    myPublisher.logEvent("showPanel");
                },
                onClearPanelState : function(payload) {
                    myPublisher.logEvent("clearPanelState");
                    myPublisher.clearPostTypes();
                    // Clear all the text fields and reset radio buttons
                },
                onSuccess : function() {
                    myPublisher.logEvent("success");
                },
                onFailure : function (payload) {
                    myPublisher.logEvent("failure");
                    myPublisher.clearPostTypes();
                    if (payload && payload.errors && payload.errors.message) {
                        alert("Error: " + payload.errors.message);
                    }
                },
                onGetPayload : function() {
                    myPublisher.logEvent("getPayload");
                    var p = {};
                    p.feedItemType = "CanvasPost";
                    // Babu - You'll need to change this accordingly.
                    p.namespace =  sr.context.application.namespace;
                    p.developerName =  sr.context.application.developerName;
                    p.parameters = JSON.stringify({eventNamespaces:myPublisher.getNamespaces()});
                    $$.client.publish(sr.client, {name : 'publisher.setPayload', payload : p});
                }
            };

            return {
                subscriptions : [
                    {name : 'publisher.setupPanel', onData : handlers.onSetupPanel},
                    {name : 'publisher.showPanel', onData : handlers.onShowPanel},
                    {name : 'publisher.clearPanelState',  onData : handlers.onClearPanelState},
                    {name : 'publisher.failure', onData : handlers.onFailure},
                    {name : 'publisher.success', onData : handlers.onSuccess},
                    {name : 'publisher.getPayload', onData : handlers.onGetPayload}
                ]
            };
        }
    };
}(Sfdc.canvas));
