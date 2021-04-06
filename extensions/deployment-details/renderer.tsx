import { LensRendererExtension, Component } from "@k8slens/extensions";
import {DeploymentDetailsProps, DeploymentDetails} from "./src/deployment-details"
import React from "react";

export default class DeploymentDetailsExtension extends LensRendererExtension {
  kubeObjectDetailItems = [
    {
      kind: "Deployment",
      apiVersions: ["apps/v1"],
      components: {
        Details: (props: DeploymentDetailsProps) => <DeploymentDetails {...props} />
      }
    }
  ];
}
