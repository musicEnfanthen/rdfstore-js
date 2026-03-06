// Simple rdfstore-js test - just the basics
var rdfstore = require('../src/store');

console.log('\n🔧 E2E Test 1/4: Basic Integration');
console.log('================================');

rdfstore.create(function(err, store) {
    if (err) return console.error('❌ Failed:', err);
    
    console.log('✅ Store created');
    
    // Load simple data
    store.load('text/turtle', '<person:john> <foaf:name> "John Doe" .', function(err, count) {
        if (err) return console.error('❌ Load failed:', err);
        
        console.log(`✅ Loaded ${count} triple(s)`);
        
        // Simple query
        store.execute('SELECT * WHERE { ?s ?p ?o }', function(err, results) {
            if (err) return console.error('❌ Query failed:', err);
            
            console.log('✅ Query results:');
            results.forEach((result, i) => {
                console.log(`   ${i+1}. ${result.s.value} → ${result.p.value} → ${result.o.value}`);
            });
            
            console.log('\n✅ Basic E2E test passed!\n');
            store.close();
        });
    });
});
