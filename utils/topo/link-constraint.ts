import { Config } from "../comm/config";

interface link {
  stream_id: number;
  vlan?: number;
  in_port: { device: string; if_index: number };
  out_port: { device: string; if_index: number };
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
  portA: Config.Renix.portList[0].portMapping,
  portB: Config.Renix.portList[1].portMapping,
  portC: Config.Renix.portList[2].portMapping,
  portD: Config.Renix.portList[3].portMapping,
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
   *                    +--------+
   *  RenixA <=> PortD--|        |                    +--------+
   *                    |  DUTA  | --PortA <=> PortA--|  DUTB  |--PortD <=> RenixB
   *  RenixC <=> PortB--|        |                    +--------+
   *                    +--------+
   */
  static two_devices_topo_links_type_3: Topolinks = {
    links: [
      {
        stream_id: 1,
        in_port: DutA.portA,
        out_port: DutB.portA,
      },
      {
        stream_id: 2,
        in_port: DutA.portB,
        out_port: Renix.portC,
      },
      {
        stream_id: 3,
        in_port: DutA.portD,
        out_port: Renix.portA,
      },
      {
        stream_id: 4,
        in_port: DutB.portD,
        out_port: Renix.portB,
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
   *  RenixC <=> PortB--|        |                   |        |    |
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
      {
        stream_id: 5,
        in_port: Renix.portC,
        out_port: DutA.portB,
      },
    ],
  };

  /**
   *
   *                       +--------+
   *     RenixA <-> PortD-|  DUTA  |--PortA---+
   *                      +--------+          |
   *                       |      |         PortA
   *                     PortB  PortC         |
   *                       |      |       +--------+
   *                       |      |       |  DUTB  |
   *                       |      |       +--------+
   *                     PortB  PortC         |
   *                       |      |         PortB
   *                      +--------+          |
   *     RenixB <-> PortD-|  DUTC  |--PortA---+
   *                      +--------+
   *
   */
  static three_devices_topo_links_type_3: Topolinks = {
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
        in_port: DutA.portB,
        out_port: DutC.portB,
      },
      {
        stream_id: 4,
        in_port: DutA.portC,
        out_port: DutC.portC,
      },
      {
        stream_id: 5,
        in_port: DutB.portB,
        out_port: DutC.portA,
      },
      {
        stream_id: 6,
        in_port: DutC.portD,
        out_port: Renix.portB,
      },
    ],
  };

  /**
   *
   * +--------+                   +--------+                   +--------+
   * |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB <=> PortB--|  DUTC  |
   * +--------+                   +--------+                   +--------+
   *
   */
  static three_devices_topo_links_type_4: Topolinks = {
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
    ],
  };

  /**
   *                    +--------+                   +--------+
   *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
   *                    +--------+                   +--------+    |
   *                                                               |
   *                                                 +--------+    |
   *                               RenixB <=> PortD--|  DUTC  |--PortB
   *                                                 +--------+
   */
  static three_devices_topo_links_type_5: Topolinks = {
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

  /**
   *
   *                                  +--------+
   *         +-----------------PortC--|  DUTD  |--PortA-----------------+
   *         |                        +--------+                       |
   *         |                            |                            |
   *         |                          PortB                          |
   *         |                            |                            |
   *       PortC                        PortC                        PortA
   *         |                            |                            |
   *    +--------+                   +--------+                   +--------+
   *    |        |--PortA <=> PortA--|        |                   |        |
   *    |  DUTA  |                   |  DUTB  |                   |  DUTC  |
   *    |        |--PortB <=> PortB--|        |                   |        |
   *    +--------+                   +--------+                   +--------+
   *        |                            |                            |
   *      PortD                        PortD                        PortD
   *        |                            |                            |
   *     RenixA                       RenixB                      *RenixC
   *
   */
  static four_devices_topo_links_type_2: Topolinks = {
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
      {
        stream_id: 3,
        in_port: DutA.portC,
        out_port: DutD.portC,
      },
      {
        stream_id: 4,
        in_port: DutA.portD,
        out_port: Renix.portA,
      },
      {
        stream_id: 5,
        in_port: DutB.portD,
        out_port: Renix.portB,
      },
      {
        stream_id: 6,
        in_port: DutB.portC,
        out_port: DutD.portB,
      },
      {
        stream_id: 7,
        in_port: DutC.portA,
        out_port: DutD.portA,
      },
      // {
      //   stream_id: 8,
      //   in_port: DutC.portD,
      //   out_port: Renix.portC,
      // },
    ],
  };
}
