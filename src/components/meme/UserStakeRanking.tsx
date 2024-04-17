import React, { useEffect, useState } from 'react';

export default function UserStakeRanking() {
  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    const fetchDataAndPopulateTable = async () => {
      try {
        const response = await fetch(
          'https://flipsidecrypto.xyz/api/v1/queries/b0cb2a69-c894-4884-8ac8-557757e8d94e/data/latest'
        );
        const data = await response.json();
        setTableData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchDataAndPopulateTable();
  }, []);

  return (
    <div className="text-white">
      <table>
        <thead>
          <tr>
            <th>Wallet</th>
            <th>$LONK</th>
            <th>$NEKO</th>
            <th>$BLACKDRAGON</th>
            <th>$SHITZU</th>
            <th>Total Balance ($)</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((item) => (
            <tr key={item.Wallet}>
              <td>{item.Wallet}</td>
              <td>
                {item.$LONK.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}
              </td>
              <td>{item.$NEKO.toLocaleString('en-US')}</td>
              <td>{item.$BLACKDRAGON.toLocaleString('en-US')}</td>
              <td>
                {item.$SHITZU.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}
              </td>
              <td>
                {item['Total Balance ($)'].toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
