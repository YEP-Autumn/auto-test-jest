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
  ICMP = 7
}

struct EthernetII {
    1: string dst,
    2: string src,
    3: i16 type
}

struct VLAN {
    1: i16 vlan,
    2: i16 type
}

struct IPv4 {
    1: i32 src,
    2: i32 dst
}

struct IPv6 {
    1: string src,
    2: string dst
}

union Field {
    1: EthernetII ether,
    2: VLAN vlan,
    3: IPv4 ipv4,
    4: IPv6 ipv6
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
