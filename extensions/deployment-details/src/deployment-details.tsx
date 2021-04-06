import React from "react";
import { Component, K8sApi, Util, Navigation } from "@k8slens/extensions";
import { reaction, autorun, observable, ObservableMap } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { deploymentApi  } from "@k8slens/extensions/dist/src/renderer/api/endpoints";

interface ImageVariables{
  image: string;
  variables: {name: string, value: string}[];
}

export interface DeploymentDetailsProps extends Component.KubeObjectMenuProps<K8sApi.Deployment> {
}

@observer
export class DeploymentDetails extends React.Component<DeploymentDetailsProps> {
  isSaving = false;
  @observable data: ImageVariables[] = [];
  @observable editableValue: {image: string, name: string, newValue: string} = {image: "test", name: "test", newValue: "test"};



  async componentDidMount() {

      autorun(() => {
        const { object: deployment } = this.props;
        if (deployment) {
          this.data  = deployment.spec.template.spec.containers.filter(v => v.env).map(v => {
            const envs = v.env.map(({name, value}) => ({name, value}))
            return ({image: v.image, variables: envs})
          });
        }
      });

  }

  updateEnvVariable(container: string, name: string, value: string) {
    const { object: deployment } = this.props;
    const kubeapi = new K8sApi.KubeApi({});
    kubeapi.update({ name: deployment.getName(), namespace: deployment.getNs()} , 
      {spec: {template: {spec: {containers: [{name: container,  env: [{name: name, value: "val"}]}]}}}})
  }


  renderSaveButton(image: string, name: string, value: string) {
    if (image == this.editableValue.image && name == this.editableValue.name && value != this.editableValue.newValue) {
      return (
        <Component.Button label = "Save" onClick={() => this.updateEnvVariable(image, name, value)}/>
      )
    }
  }


  renderVariable(image: string, name: string, value: string) {

    return (
      <div className="DrawerItem flex gaps align-center" title={name} style={{cursor:"pointer"}} >
        <span className="name">{name}</span>
        <span className={"value"} contentEditable={true} key = {(this.editableValue.image == image && this.editableValue.name == name) ? "editing" : null}
        onClick={() =>{
          this.editableValue.newValue = value;
          this.editableValue.image = image;
          this.editableValue.name = name;
        }}
        onInput={e => {
          this.editableValue.newValue = e.currentTarget.textContent;
          }}>{value}</span>
        {this.renderSaveButton(image, name, value)}
      </div>
    );
  }

  renderEnvVariablesReadOnly() {
    return (
      <>
      { this.data.length > 0 && (
        <>
          <Component.DrawerTitle title="Environment variables:"/>
          {
            this.data.map((image) => {
              return (
                <>
                  <Component.Badge label={image.image}/>
                  {image.variables.map(({name, value}) => {
                    return this.renderVariable(image.image, name, value);
                  })}
                </>
              )

            })
          }
        </>
      )
    }
    </>);
  }

  render() {
    const { object: deployment } = this.props;
    return (
      <div>

        {this.renderEnvVariablesReadOnly()}
      </div>
    );
  }
}
