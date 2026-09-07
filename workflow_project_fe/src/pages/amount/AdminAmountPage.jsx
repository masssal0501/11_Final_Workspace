import React from 'react';
import AdminAmount from '../../Amount/components/AdminAmount';

export default function AdminAmountPage({ workcationNo }) {

    console.log('🔥 AdminAmountPage 실행');
    console.log('🔥 workcationNo:', workcationNo);
    console.log('🔥 AdminAmount import:', AdminAmount);

    return (
        <div style={{ padding: '20px' }}>

            
            <AdminAmount />

        </div>
    );
}