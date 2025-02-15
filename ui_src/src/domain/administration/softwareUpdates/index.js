// Copyright 2022-2023 The Memphis.dev Authors
// Licensed under the Memphis Business Source License 1.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// Changed License: [Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0), as published by the Apache Foundation.
//
// https://github.com/memphisdev/memphis/blob/master/LICENSE
//
// Additional Use Grant: You may make use of the Licensed Work (i) only as part of your own product or service, provided it is not a message broker or a message queue product or service; and (ii) provided that you do not use, provide, distribute, or make available the Licensed Work as a Service.
// A "Service" is a commercial offering, product, hosted, or managed service, that allows third parties (other than your own employees and contractors acting on your behalf) to access and/or use the Licensed Work or a substantial set of the features or functionality of the Licensed Work to third parties as a software-as-a-service, platform-as-a-service, infrastructure-as-a-service or other similar services that compete with Licensor products or services.

import './style.scss';

import React, { useContext, useEffect, useState } from 'react';
import { ReactComponent as DeleteWrapperIcon } from '../../../assets/images/deleteWrapperIcon.svg';
import { ReactComponent as RedirectWhiteIcon } from '../../../assets/images/exportWhite.svg';
import { ReactComponent as DocumentIcon } from '../../../assets/images/documentGroupIcon.svg';
import { ReactComponent as DisordIcon } from '../../../assets/images/discordGroupIcon.svg';
import { ReactComponent as WindowIcon } from '../../../assets/images/windowGroupIcon.svg';
import DeleteItemsModal from '../../../components/deleteItemsModal';
import CloudModal from '../../../components/cloudModal';
import Button from '../../../components/button';
import Modal from '../../../components/modal';
import Copy from '../../../components/copy';
import { Context } from '../../../hooks/store';
import { ApiEndpoints } from '../../../const/apiEndpoints';
import { LATEST_RELEASE_URL } from '../../../config';
import { compareVersions } from '../../../services/valueConvertor';
import { GithubRequest } from '../../../services/githubRequests';
import { isCloud } from '../../../services/valueConvertor';
import { httpRequest } from '../../../services/http';
import AuthService from '../../../services/auth';
import { Checkbox } from 'antd';
import ImgUploader from './imgUploader';
import { LOCAL_STORAGE_USER_TYPE, LOCAL_STORAGE_ACCOUNT_ID } from '../../../const/localStorageConsts';
import Support from '../../../components/sideBar/support';
import FullLogoWhite from "../../../assets/images/white-logo.svg";
import FullLogo from "../../../assets/images/fullLogo.svg";

function SoftwareUpates({}) {
    const [state, dispatch] = useContext(Context);
    const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
    const [systemData, setSystemData] = useState({});
    const [version, setVersion] = useState('v' + state?.currentVersion);
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [latestVersionUrl, setLatestVersionUrl] = useState('');
    const [userType, setUserType] = useState('');
    const [open, modalFlip] = useState(false);
    const [checkboxdeleteAccount, setCheckboxdeleteAccount] = useState(false);
    const [delateLoader, setDelateLoader] = useState(false);
    const systemDataComponents = [
        { title: 'Amount of brokers', value: systemData?.total_amount_brokers, ossOnly: true },
        { title: 'total stations', value: systemData?.total_stations },
        { title: 'total users', value: systemData?.total_users },
        { title: 'total schemas', value: systemData?.total_schemas }
    ];

    const informationPanelData = [
        {
            icon: <DocumentIcon />,
            title: 'Read Our documentation',
            description: (
                <span>
                    Read our documentation to learn more about <span> Memphis.dev</span>
                </span>
            ),
            onClick: () => {
                window.open('https://docs.memphis.dev/memphis/getting-started/readme', '_blank');
            }
        },
        {
            icon: <DisordIcon />,
            title: 'Join our Discord',
            description: (
                <span>
                    Find <span>Memphis.dev's</span> Open-Source contributors and maintainers here
                </span>
            ),
            onClick: () => {
                window.open('https://memphis.dev/discord', '_blank');
            }
        },
        {
            icon: <WindowIcon />,
            title: 'Open a service request',
            description: <span>If you have any questions or need assistance. </span>,
            onClick: () => {
                setIsCloudModalOpen(true);
            }
        }
    ];

    const genrateInformationPanel = (item, index) => (
        <div className="item-component" key={index} onClick={() => item?.onClick()}>
            <div className="info-item">
                {item?.icon}
                <p>{item?.title}</p>
                {item?.description}
            </div>
        </div>
    );

    useEffect(() => {
        getSystemGeneralInfo();
        getSystemVersion();
        setUserType(localStorage.getItem(LOCAL_STORAGE_USER_TYPE));
    }, []);

    const getSystemGeneralInfo = async () => {
        try {
            const data = await httpRequest('GET', `${ApiEndpoints.GET_SYSTEM_GENERAL_INFO}`);
            setSystemData(data);
        } catch (err) {
            return;
        }
    };

    const getSystemVersion = async () => {
        try {
            const data = await httpRequest('GET', ApiEndpoints.GET_CLUSTER_INFO);
            if (data) {
                setVersion('v' + data?.version);
                const latest = await GithubRequest(LATEST_RELEASE_URL);
                setLatestVersionUrl(latest[0].html_url);
                const is_latest = compareVersions(data?.version, latest[0].name.replace('v', '').replace('-beta', '').replace('-latest', '').replace('-stable', ''));
                setIsUpdateAvailable(!is_latest);
            }
        } catch (error) {}
    };

    const removeMyUser = async () => {
        setDelateLoader(true);
        try {
            await httpRequest('DELETE', `${ApiEndpoints.REMOVE_MY_UER}`);
            modalFlip(false);
            AuthService.logout();
        } catch (err) {
            setDelateLoader(false);
            return;
        }
    };

    function getCompanyLogoSrc() {
        const darkMode = state?.darkMode || false;
        const fullLogoSrc = darkMode ? FullLogoWhite : FullLogo;
        return isCloud() ? state?.companyLogo || fullLogoSrc : fullLogoSrc;
    }

    return (
        <div className="softwate-updates-container">
            <div className="rows">
                <div className="item-component">
                    <div className="title-component">
                        <div className="versions"
                             onClick={() => !isCloud() && isUpdateAvailable && window.open(latestVersionUrl, '_blank')}>
                            <span className="logo-wrapper">
                                <img
                                    src={getCompanyLogoSrc() || ''}
                                    height="40"
                                    className="logoimg"
                                    alt="logo"
                                />
                            </span>
                            {isCloud() ? (
                                <div className="hostname">
                                    <p>Account ID : </p>
                                    <span>{localStorage.getItem(LOCAL_STORAGE_ACCOUNT_ID)}</span>
                                    <Copy width="12" data={localStorage.getItem(LOCAL_STORAGE_ACCOUNT_ID)}/>
                                </div>
                            ) : (
                                <label className="curr-version">{version}</label>
                            )}
                            {isUpdateAvailable && <div className="red-dot"/>}
                        </div>
                        <Button
                            width="200px"
                            height="36px"
                            placeholder={
                                <span className="change-log">
                                    <label>View Change log</label>
                                    <RedirectWhiteIcon alt="redirect"/>
                                </span>
                            }
                            colorType="white"
                            radiusType="circle"
                            backgroundColorType={'purple'}
                            fontSize="12px"
                            fontFamily="InterSemiBold"
                            onClick={() => {
                                window.open('https://docs.memphis.dev/memphis/release-notes/releases', '_blank');
                            }}
                        />
                    </div>
                </div>
                <div className="statistics">
                    {systemDataComponents.map((item, index) => {
                        return (isCloud() && !item.ossOnly) || !isCloud() ? (
                            <div className="item-component" key={`${item}-${index}`}>
                                <span className="stat-item">
                                    <label className="title">{item.title}</label>
                                    <label className="numbers">{item.value}</label>
                                </span>
                            </div>
                        ) : null;
                    })}
                </div>
                <div className="charts">{informationPanelData.map((item, index) => genrateInformationPanel(item, index))}</div>

                <div className="item-component">
                    <ImgUploader />
                </div>
                <div className="item-component">
                    <div className="delete-account-section">
                        <p className="account-title">{isCloud() ? 'Delete your organization' : 'Delete your account'}</p>
                        {isCloud() ? (
                            <label className="delete-account-description">
                                When you delete your organization, you will lose access to Memphis, and your entire organization data will be permanently deleted. You can
                                cancel the deletion for 14 days.
                            </label>
                        ) : (
                            <label className="delete-account-description">
                                When you delete your account, you will lose access to Memphis, and your profile will be permanently deleted. You can cancel the deletion
                                for 14 days.
                            </label>
                        )}

                        <div className="delete-account-checkbox">
                            <Checkbox
                                checked={checkboxdeleteAccount}
                                disabled={(isCloud() && userType !== 'root') || (!isCloud() && userType === 'root')}
                                onChange={() => setCheckboxdeleteAccount(!checkboxdeleteAccount)}
                                name="delete-account"
                            >
                                <p className={(isCloud() && userType !== 'root') || (!isCloud() && userType === 'root') ? 'disabled' : ''}>
                                    Confirm that I want to delete my {isCloud() ? 'organization' : 'account'}.
                                </p>
                            </Checkbox>
                        </div>
                        <Button
                            className="modal-btn"
                            width="200px"
                            height="36px"
                            placeholder={isCloud() ? 'Delete organization' : 'Delete account'}
                            colorType="white"
                            radiusType="circle"
                            backgroundColorType="red"
                            border="none"
                            boxShadowsType="red"
                            fontSize="14px"
                            fontWeight="600"
                            aria-haspopup="true"
                            disabled={!checkboxdeleteAccount}
                            onClick={() => modalFlip(true)}
                        />
                    </div>
                </div>
            </div>

            <Modal
                header={<DeleteWrapperIcon alt="deleteWrapperIcon" />}
                width="520px"
                height="270px"
                displayButtons={false}
                clickOutside={() => modalFlip(false)}
                open={open}
            >
                <DeleteItemsModal
                    title={isCloud() ? 'Delete your organization' : 'Delete your account'}
                    desc={
                        <>
                            Are you sure you want to delete {isCloud() ? 'your organization' : 'your account'}?
                            <br />
                            Please note that this action is irreversible.
                        </>
                    }
                    buttontxt={<>I understand, delete my {isCloud() ? 'organization' : 'account'}</>}
                    handleDeleteSelected={() => removeMyUser()}
                    loader={delateLoader}
                />
                <br />
            </Modal>
            <Modal
                width="400px"
                height="550px"
                className={'support-modal'}
                displayButtons={false}
                clickOutside={() => setIsCloudModalOpen(false)}
                open={isCloud && isCloudModalOpen}
            >
                <Support closeModal={(e) => setIsCloudModalOpen(false)} />
            </Modal>
            <CloudModal type={'bundle'} open={!isCloud() && isCloudModalOpen} handleClose={() => setIsCloudModalOpen(false)} />
        </div>
    );
}

export default SoftwareUpates;
