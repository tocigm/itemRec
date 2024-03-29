// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }

        console.log(FileTransfer);
    });
})

.controller('imageController', function($scope, $cordovaCamera, $cordovaFile) {
    // 1
    $scope.images = [];
    $scope.predictions = {};


    $scope.addImage = function() {
        // reset image
        $scope.images = ''
        // 2
        var options = {
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
            allowEdit : true,
            targetWidth: 1700,
            targetHeight: 1200,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            correctOrientation: true,
        };

        // 3
        $cordovaCamera.getPicture(options).then(function(imageData) {

            // 4
            onImageSuccess(imageData);

            function onImageSuccess(fileURI) {
                createFileEntry(fileURI);
            }

            function createFileEntry(fileURI) {
                window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
            }

            // 5
            function copyFile(fileEntry) {
                var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                var newName = makeid() + name;

                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                    fileEntry.copyTo(
                        fileSystem2,
                        newName,
                        onCopySuccess,
                        fail
                    );
                },
                fail);
            }

            // 6
            function onCopySuccess(entry) {
                $scope.$apply(function () {
                    $scope.images = $scope.urlForImage(entry.nativeURL);
                });
            }

            function fail(error) {
                console.log("fail: " + error.code);
            }

            function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i=0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }

        }, function(err) {
            console.log(err);
        });
    }

    $scope.urlForImage = function(imageName) {

        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        var trueOrigin = cordova.file.dataDirectory + name;

        uploadFile(trueOrigin, 
            function (predictions){
                
                $scope.$apply(function () {
                    $scope.predictions = JSON.parse(predictions);
                    console.log(JSON.stringify($scope.predictions));
                });
                
            }, function(error){
                alert(error)
        })

        return trueOrigin;
    }


    function uploadFile(imagePath, success, fail){
        var options = new FileUploadOptions();
        options.fileKey = 'file'
        options.fileName = imagePath.substr(imagePath.lastIndexOf('/')+1)
        options.mimeType = 'image/jpeg'

        var ft = new FileTransfer()

        var uri = "http://52.43.12.100:5000"
        ft.upload(imagePath, uri, onSuccess, onError, options)

        function onSuccess(r){
            // $scope.$apply(function () {
            //         $scope.predictions = JSON.parse(predictions);
            //         alert(JSON.stringify($scope.predictions))
            //     });
            return success(r.response)

        }

        function onError(error){
            return error.source
        }
    }



    $scope.sendEmail = function() {
        // 1
        var bodyText = "<h2>Look at this images!</h2>";
        if (null != $scope.images) {
            var images = [];
            var savedImages = $scope.images;
            for (var i = 0; i < savedImages.length; i++) {
                // 2
                images.push("" + $scope.urlForImage(savedImages[i]));
                // 3
                images[i] = images[i].replace('file://', '');
            }

            // 4
            window.plugin.email.open({
                to:          ["saimon@devdactic.com"], // email addresses for TO field
                cc:          Array, // email addresses for CC field
                bcc:         Array, // email addresses for BCC field
                attachments: images, // file paths or base64 data streams
                subject:    "Just some images", // subject of the email
                body:       bodyText, // email body (for HTML, set isHtml to true)
                isHtml:    true, // indicats if the body is HTML or plain text
            }, function () {
                console.log('email view dismissed');
            },
            this);
        }
    }
});
