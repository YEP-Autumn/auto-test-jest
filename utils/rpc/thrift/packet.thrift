namespace cl trpc_packet
namespace cpp trpc_packet
namespace d trpc_packet
namespace dart trpc_packet
namespace java trpc_packet
namespace php trpc_packet
namespace perl trpc_packet
namespace haxe trpc_packet
namespace netstd trpc_packet

enum FieldType {
  EthernetII = 1,
  VLAN = 2,
  IPv4 = 3,
  IPv6 = 4,
  TCP  = 5,
  UDP  = 6,
  ICMP = 7,
  ARP  = 8,
  RAW  = 9,
  Dot3 = 10,
  LLC  = 11,
  SNMP = 12
}

struct EthernetII {
    1: optional string dst,
    2: optional string src,
    3: optional i32 type
}

struct VLAN {
    1: optional i16 prio,
    2: optional i16 dei,
    3: optional i32 vlan,
    4: optional i32 type
}

struct IPv4 {
    1: optional i16 version,
    2: optional i16 ihl,
    3: optional i16 tos,
    4: optional i32 len,
    5: optional i32 id,
    6: optional i8 flags,
    7: optional i16 frag,
    8: optional i16 ttl,
    9: optional i16 proto,
    10:optional i32 chksum, 
    11: optional string src,
    12: optional string dst,
    13: optional string options
}

struct IPv6 {
    1: optional i16 version,
    2: optional i16 tc,
    3: optional i32 fl,
    4: optional i32 plen,
    5: optional i16 nh,
    6: optional i16 hlim,
    7: optional string src,
    8: optional string dst
}

struct ARP {
    1: optional i32 hwtype,
    2: optional i32 ptype,
    3: optional i16 hwlen,
    4: optional i16 plen,
    5: optional i32 op,
    6: optional string hwsrc,
    7: optional string psrc,
    8: optional string hwdst,
    9: optional string pdst
}

struct ICMP {
    1: optional i16 type,
    2: optional i16 code,
    3: optional i32 chksum,
    4: optional i32 id,
    5: optional i32 seq
}

struct IGMP {

}

struct TCP {
    1: optional i32 sport,
    2: optional i32 dport,
    3: optional i64 seq,
    4: optional i64 ack,
    5: optional i16 dataofs,
    6: optional i16 rsv,
    7: optional i32 flags,
    8: optional i32 window,
    9: optional i32 chksum,
    10: optional i32 urgptr,
    11: optional string options
}

struct UDP {
    1: optional i32 sport,
    2: optional i32 dport,
    3: optional i32 len,
    4: optional i32 chksum
}

struct RAW {
    1: string payload
}

struct Dot3 {
    1: optional string dst,
    2: optional string src,
    3: optional i32 len
}

struct LLC {
    1: optional i16 dsap,
    2: optional i16 ssap,
    3: optional i16 ctrl
}

struct Varbind {
    1: optional string oid,        # 点分形式，如 "1.3.6.1.2.1.1.1.0"
    2: optional string value,      # 值字符串：INTEGER 为十进制数；OCTET STRING 为 UTF-8 文本
    3: optional i32 value_type     # 0/缺省=无值(GET 用)，2=INTEGER，4=OCTET STRING，5=NULL，6=OID
}

struct SNMP {
    1: optional i32 version,           # 0=v1, 1=v2c, 3=v3
    2: optional string community,      # v1/v2c 社区名
    3: optional i32 pdu_type,          # 0=GET,1=NEXT,2=RESPONSE,3=SET,4=TRAPv1,5=BULK,6=INFORM,7=TRAPv2
    4: optional i32 request_id,        # PDU request-id
    5: optional list<Varbind> varbinds,
    6: optional i32 error,             # RESPONSE 用
    7: optional i32 error_index,
    8: optional string enterprise,     # TRAPv1
    9: optional string agent_addr,     # TRAPv1
    10: optional i32 generic_trap,     # TRAPv1
    11: optional i32 specific_trap,    # TRAPv1
    12: optional i64 time_stamp,       # TRAPv1 (timetick)
    13: optional i32 non_repeaters,    # BULK
    14: optional i32 max_repetitions,  # BULK
    15: optional i32 msg_id,           # v3 msgGlobalData.msgID
    16: optional i32 msg_max_size,     # v3 msgGlobalData.msgMaxSize
    17: optional i32 msg_flags,        # v3 msgGlobalData.msgFlags（bit0=auth, bit1=priv, bit2=reportable）
    18: optional i32 msg_security_model, # v3 msgSecurityModel（3=USM）
    19: optional string engine_id,     # v3 USM msgAuthoritativeEngineID（十六进制）
    20: optional i32 engine_boots,     # v3 USM msgAuthoritativeEngineBoots
    21: optional i32 engine_time,      # v3 USM msgAuthoritativeEngineTime
    22: optional string user_name,     # v3 USM msgUserName
    23: optional string auth_params,   # v3 USM msgAuthenticationParameters（十六进制）
    24: optional string privacy_params,# v3 USM msgPrivacyParameters（十六进制）
    25: optional string context_engine_id, # v3 scopedPDU contextEngineID（十六进制）
    26: optional string context_name   # v3 scopedPDU contextName
}

union Field {
    1: optional EthernetII ether,
    2: optional VLAN vlan,
    3: optional IPv4 ipv4,
    4: optional IPv6 ipv6,
    5: optional ARP arp,
    6: optional TCP tcp,
    7: optional UDP udp,
    8: optional ICMP icmp,
    9: optional RAW raw,
    10: optional Dot3 dot3,
    11: optional LLC llc,
    12: optional SNMP snmp
}

struct FieldMeta {
  1: FieldType type,
  2: Field field
}

struct Packet {
  1: list<FieldMeta> field_list
}

struct PacketList {
  1: list<Packet> pkt_list
}
