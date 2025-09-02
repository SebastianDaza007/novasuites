"use client";

import React, { useRef } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Ripple } from 'primereact/ripple';
import { StyleClass } from 'primereact/styleclass';

interface SidebarProps {
    visible: boolean;
    onHide: () => void;
}

export default function AppSidebar({ visible, onHide }: SidebarProps) {
    const btnRef1 = useRef(null);
    const btnRef2 = useRef(null);
    //const btnRef3 = useRef(null);
    const btnRef4 = useRef(null);

    return (
        <Sidebar
            visible={visible}
            onHide={onHide}
            className="surface-ground"
            position="left"
            style={{ width: '280px' }}
        >
            {/* Logo y cerrar */}
            <div className="flex align-items-center justify-content-between p-4">
                <span className="inline-flex align-items-center gap-2">
                    <span className="font-semibold text-2xl text-primary">Your Logo</span>
                </span>
                <Button icon="pi pi-times" rounded outlined onClick={onHide} className="h-2rem w-2rem" />
            </div>

            {/* Menú */}
            <div className="overflow-y-auto flex flex-col h-full">
                {/* FAVORITES */}
                <ul className="list-none p-0 m-0">
                    <li>
                        <StyleClass nodeRef={btnRef1} selector="@next" enterFromClassName="hidden" enterActiveClassName="slidedown" leaveToClassName="hidden" leaveActiveClassName="slideup">
                            <div ref={btnRef1} className="p-ripple p-3 flex align-items-center justify-content-between cursor-pointer text-600">
                                <span className="font-medium">FAVORITES</span>
                                <i className="pi pi-chevron-down"></i>
                                <Ripple />
                            </div>
                        </StyleClass>
                        <ul className="list-none p-0 m-0 overflow-hidden">
                            <li>
                                <a className="p-ripple flex align-items-center p-3 cursor-pointer text-700 hover:surface-100 border-round w-full">
                                    <i className="pi pi-home mr-2"></i>
                                    <span className="font-medium">Dashboard</span>
                                    <Ripple />
                                </a>
                            </li>
                            <li>
                                <a className="p-ripple flex align-items-center p-3 cursor-pointer text-700 hover:surface-100 border-round w-full">
                                    <i className="pi pi-bookmark mr-2"></i>
                                    <span className="font-medium">Bookmarks</span>
                                    <Ripple />
                                </a>
                            </li>
                            {/* Reports con submenú */}
                            <li>
                                <StyleClass nodeRef={btnRef2} selector="@next" enterFromClassName="hidden" enterActiveClassName="slidedown" leaveToClassName="hidden" leaveActiveClassName="slideup">
                                    <a ref={btnRef2} className="p-ripple flex align-items-center p-3 cursor-pointer text-700 hover:surface-100 border-round w-full">
                                        <i className="pi pi-chart-line mr-2"></i>
                                        <span className="font-medium">Reports</span>
                                        <i className="pi pi-chevron-down ml-auto mr-1"></i>
                                        <Ripple />
                                    </a>
                                </StyleClass>
                                <ul className="list-none p-0 m-0 hidden overflow-y-hidden">
                                    <li>
                                        <a className="p-ripple flex align-items-center p-3 cursor-pointer text-700 hover:surface-100 border-round w-full">
                                            <span className="font-medium">Revenue</span>
                                            <Ripple />
                                        </a>
                                    </li>
                                    <li>
                                        <a className="p-ripple flex align-items-center p-3 cursor-pointer text-700 hover:surface-100 border-round w-full">
                                            <span className="font-medium">Expenses</span>
                                            <Ripple />
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>

                {/* APPLICATION */}
                <ul className="list-none p-0 m-0 mt-auto">
                    <li>
                        <StyleClass nodeRef={btnRef4} selector="@next" enterFromClassName="hidden" enterActiveClassName="slidedown" leaveToClassName="hidden" leaveActiveClassName="slideup">
                            <div ref={btnRef4} className="p-ripple p-3 flex align-items-center justify-content-between text-600 cursor-pointer">
                                <span className="font-medium">APPLICATION</span>
                                <i className="pi pi-chevron-down"></i>
                                <Ripple />
                            </div>
                        </StyleClass>
                        <ul className="list-none p-0 m-0 overflow-hidden">
                            <li>
                                <a className="p-ripple flex align-items-center p-3 cursor-pointer text-700 hover:surface-100 border-round w-full">
                                    <i className="pi pi-folder mr-2"></i>
                                    <span className="font-medium">Projects</span>
                                    <Ripple />
                                </a>
                            </li>
                            <li>
                                <a className="p-ripple flex align-items-center p-3 cursor-pointer text-700 hover:surface-100 border-round w-full">
                                    <i className="pi pi-chart-bar mr-2"></i>
                                    <span className="font-medium">Performance</span>
                                    <Ripple />
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>

                {/* Perfil */}
                <div className="p-3 mt-auto">
                    <hr className="mb-3 surface-border" />
                    <a className="flex items-center gap-2 p-3 cursor-pointer text-700 hover:surface-100 border-round p-ripple">
                        <Avatar image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" shape="circle" />
                        <span className="font-bold">Amy Elsner</span>
                    </a>
                </div>
            </div>
        </Sidebar>
    );
}
