/**
 * Created by nbalasundaram on 10/3/15.
 */
var wd = require('wd');
var soap = require('soap');
var Q = require('q');
var testData = require("../../../../../../test_data/olr/olr.json");
module.exports = {

    getDetails: function () {
        if (process.env.RUN_ENV.toString() === "\"integration\"") {

            return testData.integration;

        } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

            return testData.staging;

        } else if (process.env.RUN_ENV.toString() === "\"production\"") {

            return testData.production;
        }
    },

    getToken: function (userName, password) {

        var deferred = Q.defer();
        var url = this.getDetails().product.url;

        var args = {uid: userName, "ns6:password": password};
        var options = {
            ignoredNamespaces: {
                namespaces: ['ns3', 'ns6'],
                override: true
            }
        };
        console.log(url);
        soap.createClient(url, options, function (err, client) {
            if (err) throw err;
            client.wsdl.definitions.xmlns.ns6 = 'java:com.tl.ssows.parameters';
            client.wsdl.xmlnsInEnvelope = client.wsdl._xmlnsMap();

            client.SSOws.SSOwsPort.getToken(args, function (err, result) {

                console.log("From OLR the user token received :: "+result.token);
                deferred.resolve(result.token);

            });


        });
        return deferred.promise;
    }


};
