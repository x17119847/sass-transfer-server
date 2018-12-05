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

  // Times (for loop)
  times: (n, block) => {
    let accum = '';
    for (var i = 0; i < n; ++i)
      accum += block.fn(i);
    return accum;
  }
}