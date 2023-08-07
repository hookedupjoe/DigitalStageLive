(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");

    //~thisPageSpecs//~
var thisPageSpecs = {
        "pageName": "Home",
        "pageTitle": "Home",
        "navOptions": {
            "topLink": true,
            "sideLink": true
        }
    }
//~thisPageSpecs~//~

    var pageBaseURL = 'app/pages/' + thisPageSpecs.pageName + '/';

    //~layoutOptions//~
thisPageSpecs.layoutOptions = {
        baseURL: pageBaseURL,
        north: false,
        east: { html: "east" },
        west: false,
        center: { html: "center" },
        south: false
    }
//~layoutOptions~//~

    //~layoutConfig//~
thisPageSpecs.layoutConfig = {
        west__size: "500"
        , east__size: "350"
    }
//~layoutConfig~//~
    //~required//~
thisPageSpecs.required = {

    }
//~required~//~

    var ThisPage = new SiteMod.SitePage(thisPageSpecs);

    var actions = ThisPage.pageActions;

    ThisPage._onPreInit = function (theApp) {
        //~_onPreInit//~

//~_onPreInit~//~
    }

    ThisPage._onInit = function () {
        //~_onInit//~

//~_onInit~//~
    }


    ThisPage._onFirstActivate = function (theApp) {
        //~_onFirstActivate//~

//~_onFirstActivate~//~
        ThisPage.initOnFirstLoad().then(
            function () {
                //~_onFirstLoad//~
window.ThisPageNow = ThisPage;

                if (ActionAppCore.spotifyToken) {
                    showStatus('ready')
                } else if (clientId) {
                    showStatus('setup')
                } else {
                    showStatus('new')
                }

                var spotifyAccessToken = sessionStorage.getItem("spotifyAccessToken") || '';
                var codeBackCode = sessionStorage.getItem("codebackcode") || '';
                const params = new URLSearchParams(window.location.search);
                const code = params.get("code");
                if(code){
                    sessionStorage.setItem("codebackcode",code);
                    window.location = window.location.origin + window.location.pathname;
                }



                var spotifyAccessTokenRefresh = sessionStorage.getItem("spotifyAccessTokenRefresh") || '';

                //--- ToDo: Use iframe to prompt to get token again?
                //--- ToDo: Timer to refresh token if app still open, before the expire time
                // ActionAppCore.apiFailAction = function(){
                //     var dfd = jQuery.Deferred();

                //     return dfd.promise();        
                // }


                //spotifyAccessToken = false;

                if (spotifyAccessToken) {
                    ActionAppCore.spotifyToken = spotifyAccessToken;
                    ActionAppCore.spotifyTokenRefresh = spotifyAccessTokenRefresh;
                    showStatus('ready');
                } else if (codeBackCode) {
                    sessionStorage.setItem("codebackcode", '');
                    getAccessInfo(clientId, codeBackCode).then(function (theInfo) {
                        if (theInfo && theInfo.access_token) {
                            ActionAppCore.spotifyToken = theInfo.access_token;
                            sessionStorage.setItem("spotifyAccessToken", ActionAppCore.spotifyToken)
                        }
                        if (theInfo && theInfo.refresh_token) {
                            ActionAppCore.spotifyTokenRefresh = theInfo.refresh_token;
                            sessionStorage.setItem("spotifyAccessTokenRefresh", ActionAppCore.spotifyTokenRefresh)
                        }
                        showStatus('ready');
                    })
                }
//~_onFirstLoad~//~
                ThisPage._onActivate();
            }
        );
    }


    ThisPage._onActivate = function () {
        //~_onActivate//~

//~_onActivate~//~
    }

    ThisPage._onResizeLayout = function (thePane, theElement, theState, theOptions, theName) {
        //~_onResizeLayout//~

//~_onResizeLayout~//~
    }

    //------- --------  --------  --------  --------  --------  --------  -------- 
    //~YourPageCode//~
var clientId = localStorage.getItem('_spotify_client_id_DigitalPuppet') || '';

    //var params = new URLSearchParams(window.location.search);
    // async function getAccessToken(theClientId, theCode) {
    //     const verifier = localStorage.getItem("verifier");

    //     if (!theCode && verifier) {
    //         return ThisApp.util.rejectedPromise('must have code and verifier set')
    //     }
    //     var dfd = jQuery.Deferred();

    //     const params = new URLSearchParams();
    //     params.append("client_id", theClientId);
    //     params.append("grant_type", "authorization_code");
    //     params.append("code", theCode);
    //     params.append("redirect_uri", "http://localhost:33480/codeback");
    //     params.append("code_verifier", verifier);


    //     const result = await fetch("https://accounts.spotify.com/api/token", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/x-www-form-urlencoded" },
    //         body: params
    //     });

    //     const { access_token } = await result.json();
    //     dfd.resolve(access_token);
    //     return dfd.promise();
    // }

    async function getAccessInfo(theClientId, theCode) {
        const verifier = localStorage.getItem("verifier");

        if (!theCode && verifier) {
            return ThisApp.util.rejectedPromise('must have code and verifier set')
        }
        var dfd = jQuery.Deferred();

        const params = new URLSearchParams();
        params.append("client_id", theClientId);
        params.append("grant_type", "authorization_code");
        params.append("code", theCode);
        params.append("redirect_uri", "http://localhost:33480/DigitalStage/");
        params.append("code_verifier", verifier);


        const result = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });

        var tmpRes = await result.json();
        dfd.resolve(tmpRes);
        return dfd.promise();
    }
    ThisPage.fetchProfile = fetchProfile;
    async function fetchProfile(token) {
        const result = await fetch("https://api.spotify.com/v1/me", {
            method: "GET", headers: { Authorization: `Bearer ` + ActionAppCore.spotifyToken }
        });

        return await result.json();
    }




    //======================================
    async function redirectToAuthCodeFlow(clientId) {
        //--- Reset cached items
        ActionAppCore.spotifyToken = false;
        sessionStorage.setItem("spotifyAccessToken", '')
        sessionStorage.setItem("spotifyAccessTokenRefresh", '')


        const verifier = generateCodeVerifier(128);
        const challenge = await generateCodeChallenge(verifier);

        localStorage.setItem("verifier", verifier);

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("response_type", "code");
        params.append("redirect_uri", "http://localhost:33480/DigitalStage/");
        params.append("scope", "user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing");
        params.append("code_challenge_method", "S256");
        params.append("code_challenge", challenge);

        document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    function generateCodeVerifier(length) {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    async function generateCodeChallenge(codeVerifier) {
        const data = new TextEncoder().encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }


    //======================================




    actions.setClientID = function () {
        ThisApp.input('Enter the Client ID', 'Spotify App Client ID', 'Save Client ID', '').then(function (theTextValue) {
            if (theTextValue) {
                localStorage.setItem('_spotify_client_id_DigitalPuppet', theTextValue);
                window.location = window.location;
            }

        });
    }

    actions.showStatus = showStatus;
    function showStatus(theStatus) {
        if (theStatus == 'ready') {
            refreshDeviceList();
        }
        ThisPage.showSubPage({ group: 'statustabs', item: theStatus })
    }

    function apiReplyGood(theResponse) {
        if (this.text) {
            ThisApp.appMessage(this.text, '', { show: true })
        }
        if (this.dfd) {
            this.dfd.resolve(theResponse);
        }
    }
    function apiReplyBad(theDetails) {
        var tmpText = this.text || 'Unknown Error, use a player to let Spotify know what to control or check API call used.';
        if (tmpText) {
            ThisApp.appMessage(this.text, '', { show: true })
        }
        if (theDetails && theDetails.status) {
            var tmpStatus = theDetails.status;
            if (tmpStatus == 404) {
                ThisApp.appMessage(tmpText, 'e', { show: true })
            } else {
                showStatus('setup');
            }
        } else {
            ThisApp.appMessage('Unknown error, try again or reload.', 'e', { show: true })
        }
        if (this.dfd) {
            this.dfd.reject(theDetails);
        }
    }

    const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1/me';

    ThisPage.refreshToken = refreshToken;
    function refreshToken() {
        this.refreshTokenCall().then(function (theInfo) {
            if (theInfo && theInfo.access_token) {
                ActionAppCore.spotifyToken = theInfo.access_token;
                sessionStorage.setItem("spotifyAccessToken", ActionAppCore.spotifyToken)
            }
            if (theInfo && theInfo.refresh_token) {
                ActionAppCore.spotifyTokenRefresh = theInfo.refresh_token;
                sessionStorage.setItem("spotifyAccessTokenRefresh", ActionAppCore.spotifyTokenRefresh)
            }
        })
    }

    ThisPage.refreshTokenCall = refreshTokenCall;
    function refreshTokenCall() {
        var tmpPayload = {
            grant_type: 'refresh_token',
            refresh_token: ActionAppCore.spotifyTokenRefresh,
            client_id: clientId
        }
        return ThisApp.apiCall({
            url: 'https://accounts.spotify.com/api/token',
            formSubmit: true,
            data: tmpPayload
        })
    }

    ThisPage.runSpotifyAPI = runSpotifyAPI;
    function runSpotifyAPI(theOptions) {
        var dfd = jQuery.Deferred();

        try {

            var tmpOptions = theOptions || {};

            var tmpMethod = tmpOptions.method || 'GET';
            var tmpRunOptions = {
                method: tmpMethod,
                authToken: ActionAppCore.spotifyToken,
                url: SPOTIFY_API_BASE_URL + tmpOptions.api
            }
            //--- ToDo: Data and post ...
            ThisApp.apiCall(tmpRunOptions).then(apiReplyGood.bind({ dfd: dfd, text: tmpOptions.successText }), apiReplyBad.bind({ dfd: dfd, text: tmpOptions.errorText }))

        } catch (error) {
            console.log('err catch', error)
        }

        return dfd.promise();
    }

    ThisPage.spotifyGet = spotifyGet;
    function spotifyGet(theAPI, theActionText) {
        return runSpotifyAPI({
            api: theAPI,
            errorText: theActionText + ' failed. Use a player somewhere to find one.',
            successText: theActionText,
        })
    }


    function spotifyPut(theAPI, theActionText, theData) {
        return spotifySendData(theAPI,theActionText, theData, 'PUT')
    }
    function spotifyPost(theAPI, theActionText, theData) {
        return spotifySendData(theAPI,theActionText, theData, 'POST')
    }

    function spotifySendData(theAPI, theActionText, theData, theMethod) {
        var tmpOptions = {
            api: theAPI,
            method: theMethod || 'POST',
            errorText: theActionText + ' failed. Use a player somewhere to find one.',
            successText: theActionText,
        }
        if( theData ){
            tmpOptions.data = theData;
        }
        return runSpotifyAPI(tmpOptions)
    }

    

    actions.playAlbum = function () {
        var tmpDetails = {
            "context_uri": "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr",
            "offset": {
                "position": 5
            },
            "position_ms": 0
        }
        return spotifyPut('/player/play', 'Play Button Clicked', tmpDetails)
    }
    actions.hitPlay = function () {
        return spotifyPut('/player/play', 'Play Button Clicked')
    }
    actions.hitPause = function () {
        return spotifyPut('/player/pause', 'Pause Button Clicked')
    }
    actions.nextTrack = function () {
        return spotifyPost('/player/next', 'Next Track Clicked')
    }
    actions.prevTrack = function () {
        return spotifyPost('/player/previous', 'Prev Track Clicked')
    }
    

    ThisPage.getCurrentlyPlaying = getCurrentlyPlaying;
    function getCurrentlyPlaying() {
        return ThisPage.spotifyGet('/player', '');
    }

    ThisPage.getDevices = getDevices;
    function getDevices() {
        return ThisPage.spotifyGet('/player/devices', '');
    }

    ThisPage.refreshDeviceList = refreshDeviceList;
    function refreshDeviceList() {
        var dfd = jQuery.Deferred();
        var tmpHTML = [];
        console.log('refreshDeviceList')
        getDevices().then(function (theReply) {
            if (theReply && theReply.devices) {
                tmpHTML.push('<div class="ui fluid vertical menu">');
                for (var iPos in theReply.devices) {
                    var tmpDevice = theReply.devices[iPos];
                    ThisPage.common.devices = theReply.devices;

                    if (tmpDevice) {
                        tmpHTML.push('<a did="' + tmpDevice.id + '" pageaction="setDefaultDevice" class="active blue item">');
                        tmpHTML.push(tmpDevice.name);

                        if (tmpDevice.is_active === true) {
                            tmpHTML.push('  <div class="ui orange left pointing label">');
                            tmpHTML.push('&nbsp;');
                            tmpHTML.push('  </div>');
                        } else {
                            tmpHTML.push('  <div class="ui left label">');
                            tmpHTML.push('&nbsp;');
                            tmpHTML.push('  </div>');
                        }
                        tmpHTML.push('</a>');

                    } else {
                        tmpHTML.push('<div class="item">No Devices Available</div>');
                    }
                }
                ThisPage.loadSpot('show-devices', tmpHTML.join('\n'));
            }
            dfd.resolve(theReply.devices);
        })
        return dfd.promise();
    }
    //--- Get first active device
    ThisPage.getActiveDevice = getActiveDevice;
    function getActiveDevice() {
        var dfd = jQuery.Deferred();
        getDevices().then(function (theReply) {
            if (theReply && theReply.devices) {
                for (var iPos in theReply.devices) {
                    var tmpDevice = theReply.devices[iPos];
                    if (tmpDevice && tmpDevice.is_active) {
                        dfd.resolve(tmpDevice);
                    }
                }
            }
            dfd.resolve(false);
        })
        return dfd.promise();
    }

    actions.setDefaultDevice = function (theParams, theTarget) {
        var tmpParams = ThisApp.getActionParams(theParams, theTarget, ['did'])
        var tmpDeviceId = tmpParams.did || '';
        ThisPage.common.activeDeviceId = tmpDeviceId;
        console.log('tmpDeviceId', tmpDeviceId);
    }
    actions.login = login;
    async function login() {
        sessionStorage.setItem('codebackto', 'SpotifyController')
        redirectToAuthCodeFlow(clientId)
        //window.location = '/codeback'
    }
//~YourPageCode~//~

})(ActionAppCore, $);
