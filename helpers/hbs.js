const moment = require('moment')

module.exports = {
  
  // Format Date
  formatDate: (date, format) => {
    return moment(date).format(format);
  },

  // Select
  select: (selected, options) => {
    return options.fn(this)
      .replace(new RegExp(' value=\"' + selected + '\"'), '$&selected="selected"')
      .replace(new RegExp('>' + selected + '</option>'), 'selected="selected"$&');
  }
  
}