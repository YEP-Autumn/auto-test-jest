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
  ARP  = 8
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
    2: optional i16 inl,
    3: optional i16 tos,
    4: optional i32 len,
    5: optional i32 id,
    6: optional i16 flags,
    7: optional i16 ttl,
    8: optional i16 proto,
    9: optional i32 chksum,
    10: optional string src,
    11: optional string dst,
    12: optional string option
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
    11: optional string option
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

union Field {
    1: optional EthernetII ether,
    2: optional VLAN vlan,
    3: optional IPv4 ipv4,
    4: optional IPv6 ipv6,
    5: optional ARP arp,
    6: optional TCP tcp,
    7: optional UDP udp,
    8: optional ICMP icmp
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
