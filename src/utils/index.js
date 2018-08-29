function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

const host = ""

export function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('/')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}

export function request(url, data, back, err) {
  wx.request({
    url: host+url,
    method: "POST",
    data: data,
    header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
    },
    success: function(res) {
      back(res.data);
    },
    fail: function(res) {
      err(res)
    }
  })
}