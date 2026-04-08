App({
  onLaunch: function() {
    console.log('App launched');
  },
  onShow: function() {
    console.log('App shown');
  },
  onHide: function() {
    console.log('App hidden');
  },
  globalData: {
    userInfo: null
  }
});