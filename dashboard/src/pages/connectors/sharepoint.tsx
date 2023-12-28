/* eslint-disable jsx-a11y/anchor-is-valid */
import {
    Breadcrumb,
    Button,
    Label,
    TextInput,
    Tooltip,
    Spinner,
    Tabs,
    Table,
    Select,
  } from "flowbite-react";
  import { FC, useEffect } from "react";
  import { useState } from "react";
  import { SiMicrosoftsharepoint } from "react-icons/si";
  import { HiOutlineTrash } from "react-icons/hi";
  
  import { HiHome } from "react-icons/hi";
  import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
  import { useUserStateContext } from "../../context/UserStateContext";
  import Text from "../../components/text";
  
  const SharepointConnectorPage: FC = function () {
    const [authorized, setAuthorized] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [clientId, setClientId] = useState("");
    const [redirectUri, setRedirectUri] = useState("");
    const [connections, setConnections] = useState([] as any[]);
    const [possibleRedirectUris, setPossibleRedirectUris] = useState([
      "https://link.psychic.dev/oauth/redirect",
    ] as string[]);
  
    const { bearer } = useUserStateContext();
  
    async function authorize(deleteCredentials: boolean) {
      setAuthLoading(true);
      const url =
        import.meta.env.VITE_SERVER_URL + "/set-custom-connector-credentials";
      var credential = null;
      if (!deleteCredentials) {
        credential = {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        };
      }
      var payload = {
        connector_id: "sharepoint",
        credential: credential,
      };
  
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearer}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        const isAuthorized = jsonData.status.is_enabled;
        console.log(jsonData);
        if (!isAuthorized) {
          console.log("failed to authenticate");
        }
        if (deleteCredentials && !isAuthorized) {
          setClientId("");
          setClientSecret("");
        }
        setAuthLoading(false);
        setAuthorized(isAuthorized);
      } catch (error) {
        setAuthLoading(false);
      }
    }
  
    useEffect(() => {
      async function getConnectorStatus() {
        const url = import.meta.env.VITE_SERVER_URL + "/get-connector-status";
        console.log(url);
        var payload = {
          connector_id: "sharepoint",
        };
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${bearer}`,
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const jsonData = await response.json();
          const isAuthorized = jsonData.status.is_enabled;
          const customCredentials = jsonData.status.custom_credentials;
          const connections = jsonData.status.connections;
          setAuthorized(isAuthorized);
          if (customCredentials) {
            setClientId(customCredentials.client_id);
            setClientSecret(customCredentials.client_secret);
            setRedirectUri(customCredentials.redirect_uri);
          }
          setPossibleRedirectUris(jsonData.status.redirect_uris);
          setConnections(connections);
          setAuthLoading(false);
        } catch (error) {
          setAuthLoading(false);
        }
      }
      if (bearer) {
        getConnectorStatus();
      }
    }, [bearer]);
  
    const deleteConnection = async (accountId: string, i: number) => {
      setDeleteLoading(true);
      const url = import.meta.env.VITE_SERVER_URL + "/delete-connection";
      var payload = {
        connector_id: "sharepoint",
        account_id: accountId,
      };
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearer}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setDeleteLoading(false);
        let newConnections = [...connections];
        newConnections.splice(i, 1);
        setConnections(newConnections);
      } catch (error) {
        setDeleteLoading(false);
      }
    };
  
    return (
      <NavbarSidebarLayout isFooter={false}>
        <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
          <div className="mb-1 w-full">
            <div className="mb-4">
              <Breadcrumb className="mb-4">
                <Breadcrumb.Item href="/">
                  <div className="flex items-center gap-x-3">
                    <HiHome className="text-xl" />
                    <Text className="dark:text-white">Home</Text>
                  </div>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Connectors</Breadcrumb.Item>
                <Breadcrumb.Item>Sharepoint</Breadcrumb.Item>
              </Breadcrumb>
              <div className="flex items-center">
                <SiMicrosoftsharepoint className="mr-2 text-xl" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Sharepoint
                </h1>
              </div>
              <Text>
                View your active connections and configure the Sharepoint connector
                here. You can create a new connection from the{" "}
                <a href="/create-connection" className="text-blue-400">
                  Create Connection page
                </a>
                .
              </Text>
            </div>
          </div>
        </div>
        <Tabs.Group>
          <Tabs.Item active={true} title="Active Connections">
            <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
              <div className="mb-1 w-full">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-lg mb-2">
                    Active connections
                  </h2>
                  <ConnectionsTable
                    connections={connections}
                    isLoading={deleteLoading}
                    deleteConnection={deleteConnection}
                  />
                </div>
              </div>
            </div>
          </Tabs.Item>
          <Tabs.Item active={true} title="Configuration">
            <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
              <div className="mb-1 w-full">
                <div className="mb-4">
                  <form>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <AuthorizeModal
                          authorize={authorize}
                          authLoading={authLoading}
                          authorized={authorized}
                          clientSecret={clientSecret}
                          setClientSecret={setClientSecret}
                          clientId={clientId}
                          setClientId={setClientId}
                          redirectUri={redirectUri}
                          setRedirectUri={setRedirectUri}
                          possibleRedirectUris={possibleRedirectUris}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </Tabs.Item>
        </Tabs.Group>
      </NavbarSidebarLayout>
    );
  };
  
  interface AuthorizeModalProps {
    authorize: (deleteCredentials: boolean) => void;
    authorized: boolean;
    authLoading: boolean;
    clientSecret: string;
    clientId: string;
    setClientId: (clientId: string) => void;
    redirectUri: string;
    possibleRedirectUris: string[];
    setRedirectUri: (redirectUri: string) => void;
    setClientSecret: (clientSecret: string) => void;
  }
  
  const AuthorizeModal: FC<AuthorizeModalProps> = function ({
    authorize,
    clientSecret,
    setClientSecret,
    clientId,
    setClientId,
    redirectUri,
    setRedirectUri,
    authorized,
    authLoading,
    possibleRedirectUris,
  }: AuthorizeModalProps) {
    console.log(authorized);
    return (
      <>
        <strong>Custom Sharepoint OAuth credentials</strong>
        <div className="mb-4">
          <Text>
            For a step-by-step guide on how to set up custom credentials see the{" "}
            <a
              href="https://docs.psychic.dev/connectors/zendesk#custom-oauth-credentials"
              className="text-blue-400"
            >
              docs
            </a>
          </Text>
        </div>
        <form>
          <div className="lg:col-span-2">
            <div>
              <Label htmlFor="apiKeys.label">Client ID</Label>
              <TextInput
                value={clientId}
                disabled={authLoading}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Client ID"
                className="mt-1"
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div>
              <Label htmlFor="apiKeys.label">Client Secret</Label>
              <TextInput
                value={clientSecret}
                disabled={authLoading}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Client Secret"
                className="mt-1"
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div>
              <Label htmlFor="apiKeys.label">Redirect URI</Label>
              <Select
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
              >
                {possibleRedirectUris.map((uri) => {
                  return (
                    <option key={uri} value={uri}>
                      {uri}
                    </option>
                  );
                })}
              </Select>
            </div>
          </div>
        </form>
        <Button
          disabled={!clientId || !clientSecret}
          className="mt-4"
          color="primary"
          onClick={() => {
            authorize(false);
          }}
        >
          {authLoading ? <Spinner /> : "Save"}
        </Button>
        <Button
          className="mt-4"
          color="primary"
          onClick={() => {
            authorize(true);
          }}
        >
          {authLoading ? <Spinner /> : "Delete Credentials"}
        </Button>
      </>
    );
  };
  
  interface ConnectionsTableProps {
    connections: any[];
    isLoading: boolean;
    deleteConnection: (accountId: string, i: number) => void;
  }
  
  const ConnectionsTable: FC<ConnectionsTableProps> = function ({
    connections,
    isLoading,
    deleteConnection,
  }: ConnectionsTableProps) {
    const [selectedIndex, setSelectedIndex] = useState(-1);
  
    const handleDelete = (accountId: string, i: number) => {
      setSelectedIndex(i);
      deleteConnection(accountId, i);
    };
  
    console.log(connections);
    return (
      <>
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <Table.Head className="bg-gray-100 dark:bg-gray-700">
            <Table.HeadCell>Account ID</Table.HeadCell>
            <Table.HeadCell>Org</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {connections.map((item, i) => (
              <Table.Row
                key={i}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Table.Cell className="whitespace-nowrap p-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {item.account_id}
                  </div>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                  <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {item.metadata.org}
                  </div>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                  <Tooltip content="Delete">
                    <Button
                      color="failure"
                      onClick={() => handleDelete(item.account_id, i)}
                      disabled={isLoading}
                    >
                      {isLoading && selectedIndex == i ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <HiOutlineTrash className="h-4 w-4" />
                      )}
                    </Button>
                  </Tooltip>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </>
    );
  };
  
  export default SharepointConnectorPage;
  