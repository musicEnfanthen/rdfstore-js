var jsonld = require('jsonld');

var toTriples = async function (input, graph, cb) {
    var rval = null;

    // convert input to normalized RDF
    const normalized = await jsonld.toRDF(input, {})

    var parseTerm = function (term) {
        if (term.termType === 'BlankNode') {
            return {'blank': term.value};
        } else if (term.termType === 'NamedNode') {
            return {'token': 'uri', 'value': term.value};
        } else if (term.termType === 'Literal') {
            if (term.language != null) {
                return {'literal': '"' + term.value + '"@' + term.language};
            } else if (term.datatype !== null) {
                return {'literal': '"' + term.value + '"^^<' + term.datatype.value + ">"};
            } else {
                return {'literal': '"' + term.value + '"'};

            }
        }
    };

    rval = [];
    var callback = function (s, p, o) {
        rval.push({
            'subject': parseTerm(s),
            'predicate': parseTerm(p),
            'object': parseTerm(o),
            'graph': graph
        });
    };


    // generate triples
    var quit = false;
    var triples = normalized;
    for (var i = 0; i < triples.length; i++) {
        var triple = triples[i];
        callback(triple.subject, triple.predicate, triple.object);
    }

    cb(null, rval);

}


// exports
exports.JSONLDParser = {};
var JSONLDParser = exports.JSONLDParser;

JSONLDParser.parser = {

    async: true,

    parse: function (data, graph, options, callback) {
        try {
            if (typeof(data) === 'string') {
                data = JSON.parse(data);
            }
            toTriples(data, graph, callback);
        } catch (error) {
            callback(error);
        }

    }

};

module.exports = {
    JSONLDParser: JSONLDParser
};
