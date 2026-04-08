var fs = require('fs');
var pop = fs.readFileSync('pages/popular-tasks/index.vue', 'utf8');
var lines = pop.split('\n');
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('待接单')) {
    console.log('L' + (i+1) + ':', lines[i]);
  }
}
