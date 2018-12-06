const moment = require('moment')

module.exports = {
  
  // Format Date
  formatDate: (date, format) => {
    return moment(date).format(format);
  },

  // Is Selected
  isSelected: (input, value) => {
    return input == value ? 'selected' : '';
  },

  // Apply Value
  applyValue: (id, values) => {
    if(values) {
      for(val of values) {
        if(val.paxTypeId == id && val.price >= 0) return val.price;
      }
    }
  },

  // Times (for loop)
  times: (n, block) => {
    let accum = '';
    for (var i = 0; i < n; ++i)
      accum += block.fn(i);
    return accum;
  }
}