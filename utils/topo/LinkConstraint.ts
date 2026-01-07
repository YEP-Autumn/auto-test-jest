import { Config } from "../comm/Config";

interface link {
  stream_id: number;
  vlan?: number;
  in_port: string;
  out_port: string;
  forward_type?: number;
}

export interface Topolinks {
  links: Array<link>;
}

const DutA = {
  portA: Config.dut_list[0]?.portMapping[0],
  portB: Config.dut_list[0]?.portMapping[1],
  portC: Config.dut_list[0]?.portMapping[2],
  portD: Config.dut_list[0]?.portMapping[3],
};

const DutB = {
  portA: Config.dut_list[1]?.portMapping[0],
  portB: Config.dut_list[1]?.portMapping[1],
  portC: Config.dut_list[1]?.portMapping[2],
  portD: Config.dut_list[1]?.portMapping[3],
};

const DutC = {
  portA: Config.dut_list[2]?.portMapping[0],
  portB: Config.dut_list[2]?.portMapping[1],
  portC: Config.dut_list[2]?.portMapping[2],
  portD: Config.dut_list[2]?.portMapping[3],
};

const DutD = {
  portA: Config.dut_list[3]?.portMapping[0],
  portB: Config.dut_list[3]?.portMapping[1],
  portC: Config.dut_list[3]?.portMapping[2],
  portD: Config.dut_list[3]?.portMapping[3],
};

const Renix = {
  portA: Config.Renix.portMapping[0],
  portB: Config.Renix.portMapping[1],
};

export class LinkConstraint {
  /**
   *
   *                    +--------+
   *  RenixA <=> PortA--|  DUTA  |--PortB <=> RenixB
   *                    +--------+
   *
   */
  static one_device_topo_links_type_1: Topolinks = {
    links: [
      {
        stream_id: 1,
        in_port: Renix.portA,
        out_port: DutA.portA,
      },
      {
        stream_id: 2,
        in_port: DutA.portB,
        out_port: Renix.portB,
      },
    ],
  };

  /**
   *
   *                    +--------+                   +--------+
   *                    |        |--PortA <=> PortA--|        |
   *  RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> RenixB
   *                    |        |--PortC <=> PortC--|        |
   *                    +--------+                   +--------+
   *
   */
  static two_devices_topo_links_type_1: Topolinks = {
    links: [
      {
        stream_id: 1,
        in_port: Renix.portA,
        out_port: DutA.portD,
      },
      {
        stream_id: 2,
        in_port: DutA.portA,
        out_port: DutB.portA,
      },
      {
        stream_id: 3,
        in_port: DutA.portC,
        out_port: DutB.portC,
      },
      {
        stream_id: 4,
        in_port: DutB.portD,
        out_port: Renix.portB,
      },
    ],
  };

  /**
   *
   *   +--------+                   +--------+
   *   |        |--PortA <=> PortA--|        |
   *   |  DUTA  |                   |  DUTB  |
   *   |        |--PortB <=> PortB--|        |
   *   +--------+                   +--------+
   *
   */
  static two_devices_topo_links_type_2: Topolinks = {
    links: [
      {
        stream_id: 1,
        in_port: DutA.portA,
        out_port: DutB.portA,
      },
      {
        stream_id: 2,
        in_port: DutA.portB,
        out_port: DutB.portB,
      },
    ],
  };

  /**
   *                    +--------+                   +--------+
   *                    |        |--PortA <=> PortA--|        |
   *  RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortB
   *                    |        |--PortC <=> PortC--|        |    |
   *                    +--------+                   +--------+    |
   *                                                               |
   *                                                 +--------+    |
   *                               RenixB <=> PortD--|  DUTC  |--PortB
   *                                                 +--------+
   */
  static three_devices_topo_links_type_1: Topolinks = {
    links: [
      {
        stream_id: 1,
        in_port: Renix.portA,
        out_port: DutA.portD,
      },
      {
        stream_id: 2,
        in_port: DutA.portA,
        out_port: DutB.portA,
      },
      {
        stream_id: 3,
        in_port: DutA.portC,
        out_port: DutB.portC,
      },
      {
        stream_id: 4,
        in_port: DutB.portB,
        out_port: DutC.portB,
      },
      {
        stream_id: 5,
        in_port: DutC.portD,
        out_port: Renix.portB,
      },
    ],
  };

  /*
   *                    +--------+                   +--------+
   *  RenixA <=> PortD--|        |                   |        |
   *                    |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
   *             PortC--|        |                   |        |    |
   *                    +--------+                   +--------+    |
   *                                                               |
   *                                                 +--------+    |
   *                               RenixB <=> PortD--|  DUTC  |--PortB
   *                                                 +--------+
   */
  static three_devices_topo_links_type_2: Topolinks = {
    links: [
      {
        stream_id: 1,
        in_port: Renix.portA,
        out_port: DutA.portD,
      },
      {
        stream_id: 2,
        in_port: DutA.portA,
        out_port: DutB.portA,
      },
      {
        stream_id: 3,
        in_port: DutB.portB,
        out_port: DutC.portB,
      },
      {
        stream_id: 4,
        in_port: DutC.portD,
        out_port: Renix.portB,
      },
    ],
  };

  /**
   *
   *    +--------+                   +--------+
   *    |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
   *    +--------+                   +--------+    |
   *                                               |
   *    +--------+                   +--------+    |
   *    |  DUTD  |--PortA <=> PortA--|  DUTC  |--PortB
   *    +--------+                   +--------+
   *
   */
  static four_devices_topo_links_type_1: Topolinks = {
    links: [
      {
        stream_id: 1,
        in_port: DutA.portA,
        out_port: DutB.portA,
      },
      {
        stream_id: 2,
        in_port: DutB.portB,
        out_port: DutC.portB,
      },
      {
        stream_id: 3,
        in_port: DutD.portA,
        out_port: DutC.portA,
      },
    ],
  };
}
