/**
 * Created by nbalasundaram on 8/25/15.
 */
var wd = require('wd');
var Q = require('q');
var _ = require('underscore');
var testData = require("../../../../../../test_data/gatewayintegration.json");
var request = require('supertest');
var tokenGlobal = "EMPTY";
module.exports = {


    getToken: function () {

        var user = testData.service.user;
        var deferred = Q.defer();
        request(testData.service.baseURL)
            .post("/ssows/rest/getToken")
            .send(user)
            .set('Accept', 'application/json')
            .expect(200)
            .then(function (res){
                var details = res.body;
                console.log("User token :  " + details.token);
                tokenGlobal = details.token;
                deferred.resolve(details.token);

            });
        return deferred.promise;
    },

    getCoursesForDeployment: function (productId) {
        var deferred = Q.defer();

        var productOfInterest = _.find(testData.lmsproduct, function(product){ return product.id === productId; });

        console.log(productOfInterest.title);
        console.log(productOfInterest.deploymentId);

        request(testData.service.lmsbaseURL)
            .get('/ws/mlapi/admin/gatewayCourses/list?iDisplayStart=0&iDisplayLength=10&sSearch_1='+productOfInterest.deploymentId+'&bSearchable_1=true')
            .set('Accept', 'application/json')
            .set('Authorization', "bearer "+tokenGlobal)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                console.log("Get Course Info Response :  " + JSON.stringify(res.body, null, 2));
                deferred.resolve(res.body.aaData);
            });

        return deferred.promise;
    },

    deleteCourse: function (courseId) {
        var deferred = Q.defer();
        request(testData.service.lmsbaseURL)
            .delete('/ws/mlapi/admin/gatewayCourses/'+courseId+'/delete')
            .set('Accept', 'application/json')
            .set('Authorization', "bearer "+tokenGlobal)
            .expect(200)
            .end(function (err,res) {
                if (err) {
                    throw err;
                }
                console.log("Delete response :  " + res.body.status);
                deferred.resolve(res.body.status);
            });
        return deferred.promise;
    }
};
