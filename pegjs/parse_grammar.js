var fs = require('fs');
var PEG = require('pegjs');

console.log('Starting parsing grammar');
(async () => {
    await fs.readFile('pegjs/sparql_query.grammar', 'utf8', function(err, grammar){
        if(err) {
            throw err;
        } else {
            var parser = PEG.generate(grammar, {output: 'source'});
            //var parser =  PEG.buildParser(grammar, {output: 'source', optimize: 'size'});
            fs.unlinkSync('src/parser.js');
            fs.writeFileSync('src/parser.js',"module.exports = "+parser);
        }
    });
    console.log('✅ Finished parsing grammar');
})();
