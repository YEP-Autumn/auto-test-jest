#thrift --gen js thrift/tutorial.thrift
#thrift --gen js:node thrift/tutorial.thrift
#thrift --gen js:ts thrift/tutorial.thrift

thrift --gen js:node thrift/packet.thrift

# 建议使用 thrift --gen js:node, 其他方式生成的代码可能存在问题
